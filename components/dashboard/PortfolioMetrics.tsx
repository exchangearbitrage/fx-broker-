"use client";

import { TrendingUp, TrendingDown, DollarSign, PieChart, ShieldAlert, Activity, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { HoverLift, StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface PortfolioMetricsProps {
  equity: number;
  balance: number;
  freeMargin: number;
  usedMargin: number;
  marginLevel: number;
  pnl24h: number;
  pnl24hPercent: number;
  unrealizedPnl: number;
  realizedPnl: number;
  currency?: string;
}

export function PortfolioMetrics({
  equity,
  balance,
  freeMargin,
  usedMargin,
  marginLevel,
  pnl24h,
  pnl24hPercent,
  unrealizedPnl,
  realizedPnl,
  currency = "USD",
}: PortfolioMetricsProps) {
  const isPositive24h = pnl24h >= 0;
  const isPositiveUnrealized = unrealizedPnl >= 0;

  return (
    <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Primary Equity & Net Worth Card */}
      <StaggerItem><HoverLift liftDistance={-4} className="h-full"><div className="relative h-full overflow-hidden rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-surface via-brand-surface/90 to-brand-primary/5 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          <span>Net Portfolio Equity</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <DollarSign className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {formatCurrency(equity, currency)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
                isPositive24h ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isPositive24h ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive24h ? "+" : ""}
              {formatPercent(pnl24hPercent)}
            </span>
            <span className="text-brand-secondary font-mono">
              ({isPositive24h ? "+" : ""}{formatCurrency(pnl24h, currency)} 24h)
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-brand-secondary">
          <span>Wallet Balance:</span>
          <span className="font-semibold text-white font-mono">{formatCurrency(balance, currency)}</span>
        </div>
      </div></HoverLift></StaggerItem>

      {/* 2. Floating Unrealized P&L */}
      <StaggerItem><HoverLift liftDistance={-4} className="h-full"><div className="h-full rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          <span>Unrealized P&L</span>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isPositiveUnrealized ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}
          >
            <Activity className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <div
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              isPositiveUnrealized ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositiveUnrealized ? "+" : ""}
            {formatCurrency(unrealizedPnl, currency)}
          </div>
          <p className="mt-2 text-xs text-brand-secondary">
            Across active margin & leveraged positions
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-brand-secondary">
          <span>Realized Total:</span>
          <span className="font-semibold text-emerald-400 font-mono">
            +{formatCurrency(realizedPnl, currency)}
          </span>
        </div>
      </div></HoverLift></StaggerItem>

      {/* 3. Available Margin / Free Liquidity */}
      <StaggerItem><HoverLift liftDistance={-4} className="h-full"><div className="h-full rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          <span>Available Margin</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <PieChart className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {formatCurrency(freeMargin, currency)}
          </div>
          <p className="mt-2 text-xs text-brand-secondary">
            Free purchasing power for new orders
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-brand-secondary">
          <span>Used Margin:</span>
          <span className="font-semibold text-white/90 font-mono">{formatCurrency(usedMargin, currency)}</span>
        </div>
      </div></HoverLift></StaggerItem>

      {/* 4. Margin Level Health */}
      <StaggerItem><HoverLift liftDistance={-4} className="h-full"><div className="h-full rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          <span>Margin Health Level</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <ShieldAlert className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold tracking-tight text-emerald-400 font-mono">
            {marginLevel > 0 ? `${marginLevel.toFixed(0)}%` : "∞"}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-primary"
                style={{ width: `${Math.min(marginLevel / 5, 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">Healthy</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-brand-secondary">
          <span>Liquidation Threshold:</span>
          <span className="font-semibold text-rose-400 font-mono">&lt; 50%</span>
        </div>
      </div></HoverLift></StaggerItem>
    </StaggerContainer>
  );
}
