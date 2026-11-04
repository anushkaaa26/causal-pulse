from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Tuple
import pandas as pd

@dataclass(frozen=True)
class MatchedMarketPair:
    treatment_unit_id: str
    treatment_city: str
    control_unit_id: str
    control_city: str
    similarity_score: float
    pre_period_rmse: float
    covariate_balance: Dict[str, float]

@dataclass(frozen=True)
class LiftAnalysisResult:
    experiment_id: str
    estimator_name: str
    absolute_lift_usd: float
    relative_lift_pct: float
    p_value: float
    confidence_interval_95: Tuple[float, float]
    is_statistically_significant: bool
    time_series_counterfactual: List[Dict[str, float]]

class MarketMatcherStrategy(ABC):
    @abstractmethod
    def match(
        self,
        df: pd.DataFrame,
        treatment_ids: List[str],
        feature_cols: List[str],
        pre_intervention_end: str,
    ) -> List[MatchedMarketPair]:
        pass

class CausalEstimatorStrategy(ABC):
    @abstractmethod
    def estimate_lift(
        self,
        df: pd.DataFrame,
        matched_pairs: List[MatchedMarketPair],
        intervention_date: str,
        metric_col: str,
    ) -> LiftAnalysisResult:
        pass
