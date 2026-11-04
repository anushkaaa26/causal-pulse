"use client";

import React, { useState } from "react";

interface Point {
  date: string;
  actual_treatment: number;
  synthetic_control: number;
  lift: number;
}

export function CausalChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-sm font-serif">Loading time series...</div>;

  const width = 700;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allVals = data.flatMap((d) => [d.actual_treatment, d.synthetic_control]);
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.05;

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minV) / (maxV - minV)) * chartH;

  const treatPoints = data.map((d, i) => `${getX(i)},${getY(d.actual_treatment)}`).join(" ");
  const ctrlPoints = data.map((d, i) => `${getX(i)},${getY(d.synthetic_control)}`).join(" ");

  // Find rollout index (Sept 1 approx)
  const rolloutIdx = data.findIndex((d) => d.date >= "2026-09-01");

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair select-none"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * width;
          const idx = Math.round(((x - padding.left) / chartW) * (data.length - 1));
          if (idx >= 0 && idx < data.length) setHoverIndex(idx);
        }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
          const y = padding.top + chartH * ratio;
          const val = Math.round(maxV - (maxV - minV) * ratio);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2dfdb" strokeDasharray="3 3" />
              <text x={padding.left - 8} y={y + 4} fill="#73706c" fontSize="10" fontFamily="monospace" textAnchor="end">
                ${val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Intervention Rollout Line */}
        {rolloutIdx !== -1 && (
          <g>
            <line
              x1={getX(rolloutIdx)}
              y1={padding.top}
              x2={getX(rolloutIdx)}
              y2={height - padding.bottom}
              stroke="#b45309"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={getX(rolloutIdx) + 6} y={padding.top + 12} fill="#b45309" fontSize="10" fontFamily="monospace">
              Rollout (Sept 1)
            </text>
          </g>
        )}

        {/* Series Lines */}
        <polyline fill="none" stroke="#73706c" strokeWidth="2" strokeDasharray="4 4" points={ctrlPoints} />
        <polyline fill="none" stroke="#1c1b1a" strokeWidth="2.5" points={treatPoints} />

        {/* Hover Crosshair & Tooltip Box */}
        {hoverIndex !== null && (
          <g>
            <line x1={getX(hoverIndex)} y1={padding.top} x2={getX(hoverIndex)} y2={height - padding.bottom} stroke="#1c1b1a" strokeWidth="1" />
            <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].actual_treatment)} r="4" fill="#1c1b1a" />
            <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].synthetic_control)} r="4" fill="#73706c" />
            
            {/* Tooltip Card inside SVG */}
            <g transform={`translate(${Math.min(getX(hoverIndex) + 10, width - 180)}, ${padding.top + 10})`}>
              <rect width="170" height="65" fill="#ffffff" stroke="#e2dfdb" rx="4" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.08))" />
              <text x="10" y="18" fill="#73706c" fontSize="10" fontFamily="monospace">{data[hoverIndex].date}</text>
              <text x="10" y="34" fill="#1c1b1a" fontSize="11" fontWeight="bold" fontFamily="monospace">Actual: ${data[hoverIndex].actual_treatment.toLocaleString()}</text>
              <text x="10" y="48" fill="#73706c" fontSize="11" fontFamily="monospace">Synthetic: ${data[hoverIndex].synthetic_control.toLocaleString()}</text>
              <text x="10" y="60" fill="#047857" fontSize="11" fontWeight="bold" fontFamily="monospace">Lift: +${data[hoverIndex].lift.toLocaleString()}</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
