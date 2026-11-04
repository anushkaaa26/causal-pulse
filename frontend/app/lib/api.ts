export interface AnalysisPayload {
  isMock: boolean;
  execution_time_ms: number;
  matched_pairs: Array<{
    treatment_unit_id: string;
    treatment_city: string;
    control_unit_id: string;
    control_city: string;
    similarity_score: number;
    pre_period_rmse: number;
    treatment_pre?: number[];
    control_pre?: number[];
    covariate_balance: Record<string, number>;
  }>;
  lift_analysis: {
    experiment_id: string;
    estimator_name: string;
    absolute_lift_usd: number;
    relative_lift_pct: number;
    p_value: number;
    confidence_interval_95: [number, number];
    is_statistically_significant: boolean;
    time_series_counterfactual: Array<{
      date: string;
      actual_treatment: number;
      synthetic_control: number;
      lift: number;
    }>;
  };
  executive_decision_simulation: {
    target_expansion_stores: number;
    annualized_lift_per_store_usd: number;
    projected_gross_lift_usd: number;
    total_rollout_cost_usd: number;
    projected_net_npv_usd: number;
    projected_roi_pct: number;
    recommendation: string;
  };
}

export async function fetchAnalysis(
  strategy: string,
  storeCount: number,
  rolloutCost: number,
  targetExpansion: number
): Promise<AnalysisPayload> {
  const storeIds = Array.from({ length: storeCount }, (_, i) => `STORE-${String(i + 1).padStart(4, "0")}`);
  try {
    const res = await fetch("http://127.0.0.1:8000/api/v1/experiments/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treatment_unit_ids: storeIds,
        intervention_date: "2026-09-01",
        matcher_strategy: strategy,
        rollout_cost_per_store_usd: rolloutCost,
        target_expansion_stores: targetExpansion,
      }),
    });
    if (!res.ok) throw new Error("Backend offline");
    const json = await res.json();
    return { isMock: false, ...json };
  } catch (err) {
    // Deterministic Mock Fallback so UI works offline
    const baseLiftPct = 7.5 + (storeCount % 3) * 0.4;
    const absLift = storeCount * 42000 * (baseLiftPct / 100);
    const annualizedLiftPerStore = (absLift / storeCount) * 3;
    const grossLift = annualizedLiftPerStore * targetExpansion;
    const totalCost = rolloutCost * targetExpansion;
    const netNpv = grossLift - totalCost;
    const roiPct = (netNpv / totalCost) * 100;

    const mockSeries = Array.from({ length: 60 }, (_, i) => {
      const dt = new Date(2026, 7, 1 + i).toISOString().split("T")[0];
      const isPost = i >= 31;
      const base = 12000 + Math.sin(i * 0.2) * 800;
      const lift = isPost ? 950 + i * 15 : 0;
      return {
        date: dt,
        actual_treatment: Math.round(base + lift + (Math.random() - 0.5) * 300),
        synthetic_control: Math.round(base + (Math.random() - 0.5) * 300),
        lift: Math.round(lift),
      };
    });

    const mockPairs = storeIds.slice(0, 10).map((id, idx) => ({
      treatment_unit_id: id,
      treatment_city: ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi NCR"][idx % 5],
      control_unit_id: `CTRL-${String(idx + 101).padStart(4, "0")}`,
      control_city: ["Ahmedabad", "Kolkata", "Chennai", "Jaipur", "Surat"][idx % 5],
      similarity_score: 0.94 - idx * 0.01,
      pre_period_rmse: 110 + idx * 4,
      treatment_pre: Array.from({ length: 12 }, () => Math.floor(11000 + Math.random() * 2000)),
      control_pre: Array.from({ length: 12 }, () => Math.floor(10800 + Math.random() * 2000)),
      covariate_balance: { avg_ticket_usd: (idx % 2 === 0 ? 1.2 : -0.8) },
    }));

    return {
      isMock: true,
      execution_time_ms: 18,
      matched_pairs: mockPairs,
      lift_analysis: {
        experiment_id: "EXP-MOCK-2026",
        estimator_name: "Difference-in-Differences (DiD)",
        absolute_lift_usd: Math.round(absLift),
        relative_lift_pct: baseLiftPct,
        p_value: 0.00342,
        confidence_interval_95: [Math.round(absLift * 0.88), Math.round(absLift * 1.12)],
        is_statistically_significant: true,
        time_series_counterfactual: mockSeries,
      },
      executive_decision_simulation: {
        target_expansion_stores: targetExpansion,
        annualized_lift_per_store_usd: Math.round(annualizedLiftPerStore),
        projected_gross_lift_usd: Math.round(grossLift),
        total_rollout_cost_usd: Math.round(totalCost),
        projected_net_npv_usd: Math.round(netNpv),
        projected_roi_pct: Math.round(roiPct),
        recommendation: netNpv > 0 ? "APPROVE FULL ROLLOUT" : "HOLD / RE-TEST",
      },
    };
  }
}
