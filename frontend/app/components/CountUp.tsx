"use client";

import { useEffect, useState } from "react";

export function CountUp({ value, formatter }: { value: number; formatter?: (v: number) => string }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = displayVal;
    let end = value;
    let duration = 600;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      let progress = Math.min((timestamp - startTime) / duration, 1);
      let current = start + (end - start) * (1 - Math.pow(1 - progress, 3)); // easeOutCubic
      setDisplayVal(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{formatter ? formatter(displayVal) : Math.round(displayVal)}</span>;
}
