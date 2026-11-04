import duckdb
import numpy as np
import pandas as pd
from pathlib import Path

DB_PATH = Path(__file__).parent / "causal_pulse.duckdb"

def init_duckdb():
    if DB_PATH.exists():
        return
    np.random.seed(42)
    n_stores = 500
    dates = pd.date_range("2026-01-01", "2026-12-31", freq="D")
    cities = ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi NCR", "Chennai", "Ahmedabad", "Kolkata"]

    store_ids = [f"STORE-{i:04d}" for i in range(1, n_stores + 1)]
    store_cities = np.random.choice(cities, size=n_stores)
    base_rev = np.random.normal(loc=12500, scale=2800, size=n_stores).clip(4000, 25000)
    base_tx = (base_rev / np.random.normal(42, 5, size=n_stores)).astype(int)
    foot_traffic = (base_tx * np.random.uniform(1.8, 2.6, size=n_stores)).astype(int)

    records = []
    treatment_set = set(store_ids[:25])

    for d_idx, dt in enumerate(dates):
        date_str = dt.strftime("%Y-%m-%d")
        seasonal = 1.0 + 0.12 * np.sin(2 * np.pi * d_idx / 365.0)
        dow_boost = 1.15 if dt.weekday() in (4, 5) else 1.0
        is_post = date_str >= "2026-09-01"

        noise = np.random.normal(1.0, 0.045, size=n_stores)
        daily_rev = base_rev * seasonal * dow_boost * noise

        for s_idx, s_id in enumerate(store_ids):
            rev = daily_rev[s_idx]
            if is_post and s_id in treatment_set:
                rev *= 1.084
            tx_cnt = max(10, int(base_tx[s_idx] * seasonal * dow_boost * noise[s_idx]))
            records.append((
                s_id,
                store_cities[s_idx],
                date_str,
                round(float(rev), 2),
                tx_cnt,
                round(float(rev / tx_cnt), 2),
                int(foot_traffic[s_idx] * seasonal),
            ))

    df = pd.DataFrame(
        records,
        columns=["unit_id", "city", "date", "revenue_usd", "tx_count", "avg_ticket_usd", "foot_traffic"],
    )

    con = duckdb.connect(str(DB_PATH))
    con.execute("CREATE TABLE merchant_telemetry AS SELECT * FROM df")
    con.execute("CREATE INDEX idx_unit_date ON merchant_telemetry(unit_id, date)")
    con.close()
    print(f"Seeded {len(df):,} rows into {DB_PATH}")

def load_telemetry_df() -> pd.DataFrame:
    init_duckdb()
    con = duckdb.connect(str(DB_PATH), read_only=True)
    df = con.execute("SELECT * FROM merchant_telemetry").df()
    con.close()
    return df
