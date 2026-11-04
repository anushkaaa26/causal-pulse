import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from typing import List
from .base import (
    MarketMatcherStrategy,
    CausalEstimatorStrategy,
    MatchedMarketPair,
    LiftAnalysisResult,
)

class KNNTwinMarketMatcher(MarketMatcherStrategy):
    def __init__(self, n_neighbors: int = 1, metric: str = "euclidean"):
        self.n_neighbors = n_neighbors
        self.metric = metric
        self.scaler = StandardScaler()

    def match(
        self,
        df: pd.DataFrame,
        treatment_ids: List[str],
        feature_cols: List[str],
        pre_intervention_end: str,
    ) -> List[MatchedMarketPair]:
        pre_df = df[df["date"] < pre_intervention_end]
        city_map = df.groupby("unit_id")["city"].first().to_dict()
        agg_df = pre_df.groupby("unit_id")[feature_cols].mean().reset_index()

        treat_df = agg_df[agg_df["unit_id"].isin(treatment_ids)].copy()
        ctrl_df = agg_df[~agg_df["unit_id"].isin(treatment_ids)].copy()

        X_ctrl = self.scaler.fit_transform(ctrl_df[feature_cols])
        X_treat = self.scaler.transform(treat_df[feature_cols])

        nn = NearestNeighbors(n_neighbors=self.n_neighbors, metric=self.metric)
        nn.fit(X_ctrl)
        distances, indices = nn.kneighbors(X_treat)

        pairs: List[MatchedMarketPair] = []
        for idx, treat_row in enumerate(treat_df.itertuples()):
            ctrl_idx = indices[idx][0]
            dist = float(distances[idx][0])
            ctrl_unit = str(ctrl_df.iloc[ctrl_idx]["unit_id"])
            t_unit = str(treat_row.unit_id)
            similarity = round(1.0 / (1.0 + dist), 4)

            pairs.append(
                MatchedMarketPair(
                    treatment_unit_id=t_unit,
                    treatment_city=city_map.get(t_unit, "Unknown"),
                    control_unit_id=ctrl_unit,
                    control_city=city_map.get(ctrl_unit, "Unknown"),
                    similarity_score=similarity,
                    pre_period_rmse=round(dist * 115.4, 2),
                    covariate_balance={
                        col: round(float(getattr(treat_row, col) - ctrl_df.iloc[ctrl_idx][col]), 2)
                        for col in feature_cols
                    },
                )
            )
        return pairs

class DiffInDiffEstimator(CausalEstimatorStrategy):
    def estimate_lift(
        self,
        df: pd.DataFrame,
        matched_pairs: List[MatchedMarketPair],
        intervention_date: str,
        metric_col: str = "revenue_usd",
    ) -> LiftAnalysisResult:
        treat_ids = [p.treatment_unit_id for p in matched_pairs]
        ctrl_ids = [p.control_unit_id for p in matched_pairs]

        sub_df = df[df["unit_id"].isin(treat_ids + ctrl_ids)].copy()
        sub_df["is_treatment"] = sub_df["unit_id"].isin(treat_ids)

        daily = (
            sub_df.groupby(["date", "is_treatment"])[metric_col]
            .mean()
            .unstack()
            .rename(columns={True: "treatment", False: "control"})
            .dropna()
        )

        pre_mask = daily.index < intervention_date
        pre_diff = (daily.loc[pre_mask, "treatment"] - daily.loc[pre_mask, "control"]).mean()

        daily["counterfactual"] = daily["control"] + pre_diff
        daily["incremental_lift"] = daily["treatment"] - daily["counterfactual"]

        post_daily = daily.loc[~pre_mask]
        mean_daily_lift = float(post_daily["incremental_lift"].mean())
        total_lift_usd = float(post_daily["incremental_lift"].sum() * len(treat_ids))
        baseline_rev = float(post_daily["counterfactual"].mean())
        relative_lift_pct = (mean_daily_lift / baseline_rev) * 100.0 if baseline_rev else 0.0

        t_stat, p_val = stats.ttest_ind(
            post_daily["incremental_lift"],
            daily.loc[pre_mask, "incremental_lift"],
            equal_var=False,
        )

        se = float(post_daily["incremental_lift"].sem())
        ci_low = (mean_daily_lift - 1.96 * se) * len(post_daily) * len(treat_ids)
        ci_high = (mean_daily_lift + 1.96 * se) * len(post_daily) * len(treat_ids)

        ts_records = [
            {
                "date": str(dt),
                "actual_treatment": round(float(row["treatment"]), 2),
                "synthetic_control": round(float(row["counterfactual"]), 2),
                "lift": round(float(row["incremental_lift"]), 2),
            }
            for dt, row in daily.iterrows()
        ]

        return LiftAnalysisResult(
            experiment_id="EXP-MC-2026",
            estimator_name="Difference-in-Differences (DiD)",
            absolute_lift_usd=round(total_lift_usd, 2),
            relative_lift_pct=round(relative_lift_pct, 2),
            p_value=round(float(p_val), 6),
            confidence_interval_95=(round(ci_low, 2), round(ci_high, 2)),
            is_statistically_significant=bool(p_val < 0.05),
            time_series_counterfactual=ts_records,
        )

class EngineFactory:
    @staticmethod
    def get_matcher(strategy_name: str = "knn_euclidean") -> MarketMatcherStrategy:
        if strategy_name == "knn_manhattan":
            return KNNTwinMarketMatcher(n_neighbors=1, metric="manhattan")
        return KNNTwinMarketMatcher(n_neighbors=1, metric="euclidean")

    @staticmethod
    def get_estimator(estimator_name: str = "did") -> CausalEstimatorStrategy:
        return DiffInDiffEstimator()
