"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { fetchAnalysis, AnalysisPayload } from "../lib/api";
import { fmtUSD, fmtPct } from "../lib/format";

export default function SimulatorPage() {
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [expansionStores, setExpansionStores] = useState(250);
  const [capEx, setCapEx] = useState(18000);

  useEffect(() => {
    fetchAnalysis("knn_euclidean", 15, capEx, expansionStores).then((res) => setData(res));
  }, [expansionStores, capEx]);

  return (
    <div className="min-h-screen">
      <Navbar isMock={data?.isMock} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="border-b border-[#e2dfdb] pb-6">
          <div className="font-mono text-xs text-[#b45309] uppercase tracking-wider mb-2">Decision Intelligence</div>
          <h1 className="text-4xl font-serif text-[#1c1b1a]">Multi-Million Dollar ROI & Expansion Simulator</h1>
          <p className="text-[#73706c] font-serif text-sm mt-1">
            Simulate net present value (NPV) and break-even probability for enterprise store network rollouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#ffffff] border border-[#e2dfdb] p-8 rounded-xl shadow-xs">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#73706c]">Target Expansion Stores</span>
              <span className="font-semibold text-[#1c1b1a]">{expansionStores} Stores</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={expansionStores}
              onChange={(e) => setExpansionStores(Number(e.target.value))}
              className="w-full accent-[#b45309] cursor-pointer"
            />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#73706c]">CapEx Rollout Cost / Store</span>
              <span className="font-semibold text-[#1c1b1a]">{fmtUSD(capEx)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={40000}
              step={1000}
              value={capEx}
              onChange={(e) => setCapEx(Number(e.target.value))}
              className="w-full accent-[#b45309] cursor-pointer"
            />
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">Projected Gross Lift</div>
              <div className="text-3xl font-serif text-[#1c1b1a]">
                {fmtUSD(data.executive_decision_simulation.projected_gross_lift_usd)}
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">Total Rollout CapEx</div>
              <div className="text-3xl font-serif text-[#b45309]">
                {fmtUSD(data.executive_decision_simulation.total_rollout_cost_usd)}
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl shadow-xs space-y-2">
              <div className="font-mono text-xs text-[#73706c] uppercase">Net Present Value (NPV)</div>
              <div className="text-3xl font-serif text-[#047857]">
                {fmtUSD(data.executive_decision_simulation.projected_net_npv_usd)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
