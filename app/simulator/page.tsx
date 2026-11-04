"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";

export default function SimulatorPage() {
  const [data, setData] = useState<any>(null);
  const [expansionStores, setExpansionStores] = useState(250);
  const [capEx, setCapEx] = useState(18000);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/experiments/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        treatment_unit_ids: ["STORE-0001", "STORE-0002", "STORE-0003", "STORE-0004", "STORE-0005"],
        intervention_date: "2026-09-01",
        matcher_strategy: "knn_euclidean",
        rollout_cost_per_store_usd: capEx,
        target_expansion_stores: expansionStores,
      }),
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, [expansionStores, capEx]);

  const fmtUSD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-mono selection:bg-zinc-800">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-6 py-8 space-y-8"
      >
        <div className="border-b border-zinc-800/80 pb-6">
          <h1 className="text-xl font-bold tracking-tight text-white">Multi-Million Dollar ROI & Expansion Simulator</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate net present value (NPV) and break-even probability for enterprise store network rollouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950 border border-zinc-800 p-6">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Target Expansion Stores: {expansionStores}</label>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={expansionStores}
              onChange={(e) => setExpansionStores(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">CapEx Rollout Cost / Store: {fmtUSD(capEx)}</label>
            <input
              type="range"
              min={5000}
              max={40000}
              step={1000}
              value={capEx}
              onChange={(e) => setCapEx(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <div className="text-xs text-zinc-400 mb-1">PROJECTED GROSS LIFT</div>
              <div className="text-2xl font-bold text-white">{fmtUSD(data.executive_decision_simulation.projected_gross_lift_usd)}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <div className="text-xs text-zinc-400 mb-1">TOTAL ROLLOUT CAPEX</div>
              <div className="text-2xl font-bold text-amber-400">{fmtUSD(data.executive_decision_simulation.total_rollout_cost_usd)}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <div className="text-xs text-zinc-400 mb-1">NET PRESENT VALUE (NPV)</div>
              <div className="text-2xl font-bold text-emerald-400">{fmtUSD(data.executive_decision_simulation.projected_net_npv_usd)}</div>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}
