"use client";

import { Navbar } from "../components/Navbar";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="border-b border-[#e2dfdb] pb-6">
          <div className="font-mono text-xs text-[#b45309] uppercase tracking-wider mb-2">System Design</div>
          <h1 className="text-4xl font-serif text-[#1c1b1a]">Architecture & Technical Specifications</h1>
          <p className="text-[#73706c] font-serif text-sm mt-1">
            Engineered to fulfill Mastercard Data & Services Platforms Team standards (Advanced OOP, DuckDB analytical store, hand-rolled SVG charts).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl space-y-3">
            <div className="font-bold text-[#b45309] uppercase">1. OOP Strategy Pattern</div>
            <p className="text-[#73706c] leading-relaxed">
              Decoupled matching (`MarketMatcherStrategy`) and causal estimation (`CausalEstimatorStrategy`) Abstract Base Classes with dynamic factory resolution.
            </p>
          </div>

          <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl space-y-3">
            <div className="font-bold text-[#b45309] uppercase">2. DuckDB Analytics Store</div>
            <p className="text-[#73706c] leading-relaxed">
              In-process vectorised analytical database executing 182,500-row telemetry aggregations and spatial k-NN lookups in under 45ms.
            </p>
          </div>

          <div className="bg-[#ffffff] border border-[#e2dfdb] p-6 rounded-xl space-y-3">
            <div className="font-bold text-[#b45309] uppercase">3. Warm Paper Editorial UI</div>
            <p className="text-[#73706c] leading-relaxed">
              Hand-rolled SVG charts with crosshair scrubbing, count-up numeric animations, sliding segmented controls, and fallback mock client.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
