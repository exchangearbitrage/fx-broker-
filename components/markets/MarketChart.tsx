"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketPoint } from "@/lib/market-data/types";
import { formatCurrency } from "@/lib/utils";

type MarketChartProps = {
  symbol: string;
  currency: string;
  histories: Record<string, MarketPoint[]>;
};

const timeframes = ["1D", "1W", "1M", "1Y"];

export function MarketChart({ symbol, currency, histories }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState("1D");
  const [liveHistories, setLiveHistories] = useState(histories);
  const [loading, setLoading] = useState(false);
  const points = liveHistories[timeframe] ?? [];
  const path = useMemo(() => buildPath(points), [points]);
  const last = points[points.length - 1]?.price ?? 0;
  const first = points[0]?.price ?? last;
  const positive = last >= first;

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      setLoading(true);
      try {
        const response = await fetch(`/api/markets/${encodeURIComponent(symbol)}/history?timeframe=${timeframe}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { history?: MarketPoint[] };
        if (!cancelled && data.history?.length) {
          setLiveHistories((current) => ({ ...current, [timeframe]: data.history ?? [] }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    const interval = window.setInterval(refresh, timeframe === "1D" ? 45000 : 120000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [symbol, timeframe]);

  return (
    <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="rounded-brand bg-brand-background/45 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-brand-secondary">{symbol}</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{formatCurrency(last, currency)}</p>
            <p className="mt-1 text-xs text-brand-secondary">{loading ? "Updating..." : "Streaming market view"}</p>
          </div>
          <div className="grid grid-cols-4 gap-1 rounded-brand bg-brand-surface p-1">
            {timeframes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTimeframe(item)}
                className={`rounded-[calc(var(--radius-brand)-2px)] px-3 py-2 text-xs font-semibold transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96] ${
                  timeframe === item ? "bg-brand-primary text-black" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 h-72">
          <svg viewBox="0 0 720 280" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`${symbol} ${timeframe} price chart`}>
            <defs>
              <linearGradient id={`fill-${symbol}-${timeframe}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={positive ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"} stopOpacity="0.22" />
                <stop offset="100%" stopColor={positive ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${path} L 720 280 L 0 280 Z`} fill={`url(#fill-${symbol}-${timeframe})`} />
            <path d={path} fill="none" stroke={positive ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function buildPath(points: MarketPoint[]) {
  if (!points.length) return "M 0 140";
  const values = points.map((point) => point.price).filter(Number.isFinite);
  if (!values.length) return "M 0 140";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 720;
      const price = Number.isFinite(point.price) ? point.price : min;
      const y = 260 - ((price - min) / span) * 240;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
