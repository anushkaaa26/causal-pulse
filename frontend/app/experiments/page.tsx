"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sparkline } from "../components/Sparkline";
import { fetchAnalysis, AnalysisPayload } from "../lib/api";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ExperimentsPage() {
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis("knn_euclidean", 15, 18000, 200).then((res) => setData(res));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar isMock={data?.isMock} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="border-b border-[#e2dfdb] pb-6">
          <div className="font-mono text-xs text-[#b45309] uppercase tracking-wider mb-2">Twin-Market Matrix</div>
          <h1 className="text-4xl font-serif text-[#1c1b1a]">Experiment Cohort Breakdown</h1>
          <p className="text-[#73706c] font-serif text-sm mt-1">
            Detailed covariate pairing, RMSE distance metrics, and pre-period sparklines for treatment and control store units.
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#e2dfdb] rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#e2dfdb] text-[#73706c] uppercase bg-[#f9f8f6]">
                <th className="py-4 px-6">Treatment Unit</th>
                <th className="py-4 px-6">Matched Control Twin</th>
                <th className="py-4 px-6">Similarity Score</th>
                <th className="py-4 px-6">Pre-Period RMSE</th>
                <th className="py-4 px-6">Pre-Period Sparkline</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2dfdb]">
              {data?.matched_pairs?.map((pair) => {
                const isExpanded = expandedId === pair.treatment_unit_id;
                return (
                  <React.Fragment key={pair.treatment_unit_id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : pair.treatment_unit_id)}
                      className="hover:bg-[#f9f8f6] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-[#1c1b1a]">
                        {pair.treatment_unit_id} <span className="font-normal text-[#73706c]">({pair.treatment_city})</span>
                      </td>
                      <td className="py-4 px-6 text-[#b45309] font-semibold">
                        {pair.control_unit_id} <span className="font-normal text-[#73706c]">({pair.control_city})</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-[#eae6df] rounded text-[#1c1b1a]">
                          {(pair.similarity_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#73706c]">${pair.pre_period_rmse}</td>
                      <td className="py-4 px-6">
                        <Sparkline data={pair.treatment_pre} />
                      </td>
                      <td className="py-4 px-6 text-right text-[#73706c]">
                        {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#f9f8f6]/80">
                        <td colSpan={6} className="p-6 font-mono text-xs text-[#73706c] space-y-2">
                          <div className="font-bold text-[#1c1b1a] uppercase">Covariate Balance Inspection</div>
                          <div>Ticket Size Delta: ${pair.covariate_balance.avg_ticket_usd ?? 0} vs control baseline</div>
                          <div>Algorithm Used: k-Nearest Neighbors Euclidean Distance Vector Space Matcher</div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
