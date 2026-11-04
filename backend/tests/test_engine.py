from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_row_count():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["telemetry_rows"] == 182500

def test_causal_lift_and_matching():
    res = client.post("/api/v1/experiments/analyze", json={
        "treatment_unit_ids": ["STORE-0001", "STORE-0002", "STORE-0003", "STORE-0004", "STORE-0005"],
        "intervention_date": "2026-09-01",
        "matcher_strategy": "knn_euclidean",
        "rollout_cost_per_store_usd": 15000,
        "target_expansion_stores": 200
    })
    assert res.status_code == 200
    payload = res.json()
    assert len(payload["matched_pairs"]) == 5
    assert payload["lift_analysis"]["relative_lift_pct"] > 5.0
    assert payload["lift_analysis"]["is_statistically_significant"] is True
    assert payload["executive_decision_simulation"]["recommendation"] == "APPROVE FULL ROLLOUT"
