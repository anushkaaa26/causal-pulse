export function Sparkline({ data }: { data?: number[] }) {
  if (!data || data.length === 0) return <span className="text-[#73706c] text-[10px]">No telemetry</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 24;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke="#b45309" strokeWidth="1.5" points={points} />
    </svg>
  );
}
