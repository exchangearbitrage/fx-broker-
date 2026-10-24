"use client";

import { Users, Award, Shield, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import type { StrategyProvider } from "./types";
import { Sparkline } from "@/components/markets/Sparkline";

interface CopyTradingDeskProps {
  providers: StrategyProvider[];
  onSelectProvider: (provider: StrategyProvider) => void;
  isCopied?: (providerId: string) => boolean;
}

export function CopyTradingDesk({ providers, onSelectProvider, isCopied }: CopyTradingDeskProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
              Automated Mirror Execution
            </span>
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              1-Click Copy
            </span>
          </div>
          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
            Verified Strategy Providers
          </h2>
          <p className="text-xs text-brand-secondary mt-1">
            Mirror verified high-performing traders automatically with zero management fee and customized risk limits.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-brand-secondary">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-brand-primary" /> Max Drawdown Guard
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Audited Track Records
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((p) => {
          const copied = isCopied?.(p.id) ?? false;
          return (
            <div
              key={p.id}
              className={`flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 ${
                copied
                  ? "border-brand-primary/50 bg-brand-primary/[0.04] shadow-lg shadow-brand-primary/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Handle */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/15 font-bold text-white shadow-inner">
                      {p.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{p.name}</h4>
                      <p className="text-xs text-brand-secondary">{p.handle}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.riskScore <= 2
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : p.riskScore === 3
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    Risk {p.riskScore}/5
                  </span>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-brand-secondary"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                {/* Key stats: 30D ROI & Win Rate */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-black/30 p-2.5">
                  <div>
                    <span className="text-[10px] uppercase text-brand-secondary">30d ROI</span>
                    <p className="font-mono text-base font-bold text-emerald-400">+{p.roi30d}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-brand-secondary">Win Rate</span>
                    <p className="font-mono text-base font-bold text-white">{p.winRate}%</p>
                  </div>
                </div>

                {/* Mini equity curve sparkline */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-brand-secondary">
                    <span>Performance Curve</span>
                    <span className="text-emerald-400 font-mono">All-time High</span>
                  </div>
                  <Sparkline points={p.sparkline} positive className="mt-1 h-10 w-full" />
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-brand-secondary line-clamp-2">
                  {p.description}
                </p>
              </div>

              {/* Footer: Copiers, AUM, and Action button */}
              <div className="mt-4 border-t border-white/5 pt-3">
                <div className="mb-3 flex items-center justify-between text-xs text-brand-secondary font-mono">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {p.copiers.toLocaleString()} copiers
                  </span>
                  <span>AUM: {p.aum}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectProvider(p)}
                  className={`w-full rounded-xl py-2 text-xs font-semibold transition-all ${
                    isCopied
                      ? "border border-brand-primary bg-brand-primary/20 text-brand-primary flex items-center justify-center gap-1.5"
                      : "bg-brand-primary text-black hover:brightness-105 active:scale-98"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> <Link href="/dashboard/copy">Manage Mirroring</Link>
                    </>
                  ) : (
                    "Copy Strategy"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
