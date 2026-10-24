"use client";

import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";

type Timeframe = "1D" | "1W" | "1M" | "1Y";

interface ChartPoint {
  date: string;
  value: number;
}

const mockChartData: Record<Timeframe, { points: ChartPoint[]; change: number; changePercent: number }> = {
  "1D": {
    change: 4120.5,
    changePercent: 3.21,
    points: [
      { date: "00:00", value: 128330 },
      { date: "03:00", value: 127900 },
      { date: "06:00", value: 128450 },
      { date: "09:00", value: 129800 },
      { date: "12:00", value: 130450 },
      { date: "15:00", value: 131200 },
      { date: "18:00", value: 131800 },
      { date: "21:00", value: 132450 },
    ],
  },
  "1W": {
    change: 11450.0,
    changePercent: 9.46,
    points: [
      { date: "Mon", value: 121000 },
      { date: "Tue", value: 122400 },
      { date: "Wed", value: 124800 },
      { date: "Thu", value: 123900 },
      { date: "Fri", value: 127600 },
      { date: "Sat", value: 129500 },
      { date: "Sun", value: 132450 },
    ],
  },
  "1M": {
    change: 28900.0,
    changePercent: 27.91,
    points: [
      { date: "Sep 10", value: 103550 },
      { date: "Sep 15", value: 108200 },
      { date: "Sep 20", value: 112400 },
      { date: "Sep 25", value: 119800 },
      { date: "Sep 30", value: 123400 },
      { date: "Oct 05", value: 126900 },
      { date: "Oct 10", value: 132450 },
    ],
  },
  "1Y": {
    change: 62450.0,
    changePercent: 89.21,
    points: [
      { date: "Nov", value: 70000 },
      { date: "Jan", value: 78500 },
      { date: "Mar", value: 89000 },
      { date: "May", value: 98400 },
      { date: "Jul", value: 106200 },
      { date: "Sep", value: 121000 },
      { date: "Oct", value: 132450 },
    ],
  },
};

export function PerformanceChart({ currency = "USD" }: { currency?: string }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeData = mockChartData[timeframe];
  const points = activeData.points;
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = maxVal - minVal || 1;

  const width = 800;
  const height = 240;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;

  // Generate SVG path coordinates
  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((p.value - minVal) / span) * chartHeight;
    return { x, y, ...p };
  });

  const lineD = coords.reduce((acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x} ${curr.y}`, "");
  const areaD = `${lineD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  const activePoint = hoverIndex !== null ? coords[hoverIndex] : coords[coords.length - 1];

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
      {/* Header and timeframe selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
              Equity Growth & Performance
            </span>
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              Live Audited
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-white sm:text-3xl">
              {formatCurrency(activePoint.value, currency)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              +{formatPercent(activeData.changePercent)} ({timeframe})
            </span>
          </div>
        </div>

        {/* Timeframe pill buttons */}
        <div className="inline-flex self-start rounded-xl border border-white/10 bg-black/30 p-1">
          {(["1D", "1W", "1M", "1Y"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setTimeframe(tf);
                setHoverIndex(null);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                timeframe === tf
                  ? "bg-brand-primary text-black shadow-sm"
                  : "text-brand-secondary hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative mt-4 h-56 w-full select-none">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF61" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#00FF61" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#00FF61" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255,255,255,0.08)"
          />

          {/* Area gradient */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Stroke path */}
          <path
            d={lineD}
            fill="none"
            stroke="#00FF61"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover circle & guide */}
          {coords.map((coord, i) => (
            <g
              key={coord.date}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <rect
                x={coord.x - (chartWidth / points.length) / 2}
                y={paddingTop}
                width={chartWidth / points.length}
                height={chartHeight}
                fill="transparent"
              />
              {hoverIndex === i && (
                <>
                  <line
                    x1={coord.x}
                    y1={paddingTop}
                    x2={coord.x}
                    y2={height - paddingBottom}
                    stroke="rgba(255,255,255,0.25)"
                    strokeDasharray="3 3"
                  />
                  <circle cx={coord.x} cy={coord.y} r="5" fill="#00FF61" stroke="#000" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="mt-1 flex justify-between px-2 text-[11px] text-brand-secondary font-mono">
          {points.map((p) => (
            <span key={p.date}>{p.date}</span>
          ))}
        </div>
      </div>

      {/* Chart Footer Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs sm:grid-cols-4">
        <div>
          <span className="text-brand-secondary">Period Low:</span>
          <p className="font-mono font-semibold text-white">{formatCurrency(minVal, currency)}</p>
        </div>
        <div>
          <span className="text-brand-secondary">Period High:</span>
          <p className="font-mono font-semibold text-emerald-400">{formatCurrency(maxVal, currency)}</p>
        </div>
        <div>
          <span className="text-brand-secondary">Sharpe Ratio:</span>
          <p className="font-mono font-semibold text-white">2.84</p>
        </div>
        <div>
          <span className="text-brand-secondary">Max Drawdown:</span>
          <p className="font-mono font-semibold text-white">-4.12%</p>
        </div>
      </div>
    </div>
  );
}
