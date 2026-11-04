"use client";

import { motion } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex bg-[#eae6df] p-1 rounded-lg border border-[#e2dfdb] relative font-mono text-xs">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative px-4 py-2 z-10 transition-colors duration-200 cursor-pointer ${
              selected ? "text-[#1c1b1a] font-semibold" : "text-[#73706c] hover:text-[#1c1b1a]"
            }`}
          >
            {opt.label}
            {selected && (
              <motion.div
                layoutId="segmented-pill"
                className="absolute inset-0 bg-white rounded-md shadow-sm border border-[#d6d0c7] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
