from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dataclasses import asdict
import time

from app.data.seed_data import load_telemetry_df, init_duckdb
from app.engines.strategies import EngineFactory

TELEMETRY_DF = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global TELEMETRY_DF
    init_duckdb()
    TELEMETRY_DF = load_telemetry_df()
    yield

app = FastAPI(
    title="CausalPulse — Enterprise Geo-Experimentation & Decision Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExperimentRequest(BaseModel):
    treatment_unit_ids: List[str] = Field(
        default=[f"STORE-{i:04d}" for i in range(1, 16)],
        description="Store IDs receiving the treatment rollout",
    )
    intervention_date: str = Field(default="2026-09-01")
    matcher_strategy: str = Field(default="knn_euclidean")
    rollout_cost_per_store_usd: float = Field(default=18000.0)
    target_expansion_stores: int = Field(default=200)

@app.get("/api/v1/health")
def health_check():
    global TELEMETRY_DF
    if TELEMETRY_DF is None:
        TELEMETRY_DF = load_telemetry_df()
    return {"status": "healthy", "telemetry_rows": len(TELEMETRY_DF), "engine": "DuckDB + CausalPulse OOP"}

@app.post("/api/v1/experiments/analyze")
def run_experiment_analysis(req: ExperimentRequest):
    global TELEMETRY_DF
    if TELEMETRY_DF is None:
        TELEMETRY_DF = load_telemetry_df()

    t0 = time.perf_counter()
    feature_cols = ["revenue_usd", "tx_count", "avg_ticket_usd", "foot_traffic"]

    matcher = EngineFactory.get_matcher(req.matcher_strategy)
    matched_pairs = matcher.match(
        df=TELEMETRY_DF,
        treatment_ids=req.treatment_unit_ids,
        feature_cols=feature_cols,
        pre_intervention_end=req.intervention_date,
    )

    estimator = EngineFactory.get_estimator("did")
    lift_result = estimator.estimate_lift(
        df=TELEMETRY_DF,
        matched_pairs=matched_pairs,
        intervention_date=req.intervention_date,
        metric_col="revenue_usd",
    )

    n_treat = max(1, len(req.treatment_unit_ids))
    lift_per_store = lift_result.absolute_lift_usd / n_treat
    annualized_lift_per_store = lift_per_store * (365.0 / 122.0)
    projected_gross_lift = annualized_lift_per_store * req.target_expansion_stores
    total_rollout_cost = req.rollout_cost_per_store_usd * req.target_expansion_stores
    net_npv_usd = projected_gross_lift - total_rollout_cost
    roi_pct = (net_npv_usd / total_rollout_cost) * 100.0 if total_rollout_cost else 0.0

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "execution_time_ms": elapsed_ms,
        "matched_pairs": [asdict(p) for p in matched_pairs],
        "lift_analysis": asdict(lift_result),
        "executive_decision_simulation": {
            "target_expansion_stores": req.target_expansion_stores,
            "annualized_lift_per_store_usd": round(annualized_lift_per_store, 2),
            "projected_gross_lift_usd": round(projected_gross_lift, 2),
            "total_rollout_cost_usd": round(total_rollout_cost, 2),
            "projected_net_npv_usd": round(net_npv_usd, 2),
            "projected_roi_pct": round(roi_pct, 2),
            "recommendation": "APPROVE FULL ROLLOUT" if (lift_result.is_statistically_significant and net_npv_usd > 0) else "HOLD / RE-TEST",
        },
    }
