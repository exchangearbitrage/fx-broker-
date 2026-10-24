"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, ShieldCheck, RefreshCw, Zap } from "lucide-react";
import type { AccountMode } from "./types";

interface DashboardHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  mode: AccountMode;
  onModeChange: (mode: AccountMode) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenNewOrder: () => void;
  kycStatus?: string;
}

export function DashboardHeader({
  user,
  mode,
  onModeChange,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenNewOrder,
  kycStatus,
}: DashboardHeaderProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader";
  const isKycApproved = kycStatus === "APPROVED" || kycStatus === "VERIFIED";

  return (
    <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
      {/* User info & account badges */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 via-brand-primary/10 to-transparent border border-brand-primary/30 text-xl font-bold text-brand-primary shadow-inner">
          {fullName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
              {fullName}
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isKycApproved ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {isKycApproved ? "Identity verified" : "Verification in review"}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-secondary sm:text-sm">
            <span>{user.email || "Signed-in trader"}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ultra-Low Latency Feed (7.4ms)
            </span>
          </div>
        </div>
      </div>

      {/* Mode toggle & Action CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Live / Demo Mode Toggle */}
        <div className="inline-flex items-center rounded-xl border border-white/10 bg-brand-surface/80 p-1 backdrop-blur-md shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange("live")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              mode === "live"
                ? "bg-brand-primary text-black shadow-md shadow-brand-primary/20"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${mode === "live" ? "bg-black" : "bg-emerald-500"}`} />
            Live Account
          </button>
          <button
            type="button"
            onClick={() => onModeChange("demo")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              mode === "demo"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            Demo ($100k)
          </button>
        </div>

        {/* Deposit Button */}
        <button
          type="button"
          onClick={onOpenDeposit}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-black shadow-md shadow-brand-primary/25 transition-transform duration-150 hover:brightness-105 active:scale-95"
        >
          <ArrowDownLeft className="h-4 w-4" />
          Deposit
        </button>

        {/* Withdraw Button */}
        <button
          type="button"
          onClick={onOpenWithdraw}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-white/10 hover:border-white/25 active:scale-95"
        >
          <ArrowUpRight className="h-4 w-4" />
          Withdraw
        </button>

        {/* New Order Button */}
        <button
          type="button"
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition-colors duration-150 hover:bg-brand-primary/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Order
        </button>
      </div>
    </div>
  );
}
