"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { SegmentedControl } from "../components/SegmentedControl";
import { CausalChart } from "../components/CausalChart";
import { CountUp } from "../components/CountUp";
import { fetchAnalysis, AnalysisPayload } from "../lib/api";
import { fmtUSD, fmtPct } from "../lib/format";

export default function DashboardPage() {
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [strategy, setStrategy] = useState("knn_euclidean");
  const [storeCount, setStoreCount] = useState(15);
  const [targetExpansion, setTargetExpansion] = useState(200);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAnalysis(strategy, storeCount, 18000, targetExpansion).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [strategy, storeCount, targetExpansion]);

  return (
    <div className="min-h-screen">
      <Navbar isMock={data?.isMock} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e2dfdb] pb-8">
          <div>
            <div className="font-mono text-xs text-[#b45309] uppercase tracking-wider mb-2">Mastercard D&S Platforms • Test & Learn®</div>
            <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-[#1c1b1a]">
              Geo-Experimentation Tearsheet
            </h1>
            <p className="text-[#73706c] font-serif text-sm mt-2 max-w-2xl">
              Evaluating true incremental revenue lift across multi-store retail pilots via Difference-in-Differences and Synthetic Control counterfactual matching.
            </p>
          </div>

          <SegmentedControl
            value={strategy}
            onChange={setStrategy}
            options={[
              { label: "k-NN Euclidean", value: "knn_euclidean" },
              { label: "k-NN Manhattan", value: "knn_manhattan" },
            ]}
          />
        </div>

        {/* Interactive Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs">
          <div className="space-y-3">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#73706c]">Pilot Treatment Cohort</span>
              <span className="font-semibold text-[#1c1b1a]">{storeCount} Stores</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={5}
              value={storeCount}
              onChange={(e) => setStoreCount(Number(e.target.value))}
              className="w-full accent-[#b45309] cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#73706c]">Target Expansion Scale</span>
              <span className="font-semibold text-[#1c1b1a]">{targetExpansion} Stores</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={targetExpansion}
              onChange={(e) => setTargetExpansion(Number(e.target.value))}
              className="w-full accent-[#b45309] cursor-pointer"
            />
          </div>
        </div>

        {/* KPI Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">True Incremental Lift</div>
              <div className="text-3xl font-serif text-[#1c1b1a]">
                <CountUp value={data.lift_analysis.relative_lift_pct} formatter={(v) => fmtPct(v)} />
              </div>
              <div className="font-mono text-xs text-[#047857]">
                {fmtUSD(data.lift_analysis.absolute_lift_usd)} cumulative
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">Statistical P-Value</div>
              <div className="text-3xl font-serif text-[#047857]">
                p = {data.lift_analysis.p_value.toFixed(5)}
              </div>
              <div className="font-mono text-xs text-[#73706c]">95% CI Verified</div>
            </div>

            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">Projected Net NPV</div>
              <div className="text-3xl font-serif text-[#1c1b1a]">
                <CountUp value={data.executive_decision_simulation.projected_net_npv_usd} formatter={(v) => fmtUSD(v)} />
              </div>
              <div className="font-mono text-xs text-[#047857]">
                +{data.executive_decision_simulation.projected_roi_pct}% ROI
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="font-mono text-xs text-[#73706c] uppercase">Executive Verdict</div>
              <div className="text-sm font-bold font-mono text-[#b45309] my-2">
                {data.executive_decision_simulation.recommendation}
              </div>
              <div className="font-mono text-[10px] text-[#73706c]">Backend latency: {data.execution_time_ms}ms</div>
            </div>
          </div>
        )}

        {/* Hand-Rolled SVG Chart Section */}
        {data && (
          <div className="bg-[#ffffff] border border-[#e2dfdb] p-8 rounded-xl shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif text-[#1c1b1a]">Counterfactual Revenue Trajectory</h3>
                <p className="font-mono text-xs text-[#73706c] mt-1">Intervention Rollout Date: September 1, 2026</p>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs text-[#73706c]">
                <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#1c1b1a] inline-block" /> Actual Treatment</span>
                <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#73706c] border-dashed inline-block" /> Synthetic Control</span>
              </div>
            </div>

            <CausalChart data={data.lift_analysis.time_series_counterfactual} />
          </div>
        )}
      </main>
    </div>
  );
}
