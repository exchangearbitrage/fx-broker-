type SparklineProps = {
  points: number[];
  positive?: boolean;
  className?: string;
};

export function Sparkline({ points, positive = true, className = "" }: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 32 - ((point - min) / span) * 28 - 2;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 34" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke={positive ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
