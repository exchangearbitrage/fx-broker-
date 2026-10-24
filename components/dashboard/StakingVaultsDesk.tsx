"use client";

import { Sparkles, Coins, Lock, CheckCircle2, ArrowUpRight } from "lucide-react";
import type { StakingVault } from "./types";
import { formatCurrency } from "@/lib/utils";

interface StakingVaultsDeskProps {
  vaults: StakingVault[];
  onSelectVault: (vault: StakingVault) => void;
  currency?: string;
}

export function StakingVaultsDesk({ vaults, onSelectVault, currency = "USD" }: StakingVaultsDeskProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
              Passive Yield & Rewards
            </span>
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              Daily Distribution
            </span>
          </div>
          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
            Staking & Yield Vaults
          </h2>
          <p className="text-xs text-brand-secondary mt-1">
            Put idle capital to work. Earn up to 9.0% annual percentage yield with flexible and fixed duration pools.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">
          <Sparkles className="h-4 w-4 text-brand-primary" />
          <span>Automated Daily Compounding</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vaults.map((vault) => {
          const hasStaked = (vault.userStaked ?? 0) > 0;
          return (
            <div
              key={vault.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4.5 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-black font-extrabold text-sm"
                      style={{ backgroundColor: vault.iconBg }}
                    >
                      {vault.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{vault.name}</h4>
                      <p className="text-xs text-brand-secondary">{vault.symbol}</p>
                    </div>
                  </div>

                  <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-brand-primary">
                    {vault.apy}% APY
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-black/30 p-2.5 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-brand-secondary">
                    <span>Lock Period:</span>
                    <span className="text-white font-semibold">{vault.period}</span>
                  </div>
                  <div className="flex justify-between text-brand-secondary">
                    <span>Min. Amount:</span>
                    <span className="text-white">{vault.minAmount} {vault.symbol}</span>
                  </div>
                  <div className="flex justify-between text-brand-secondary">
                    <span>Pool Size:</span>
                    <span className="text-white">{vault.totalStaked}</span>
                  </div>
                </div>

                {hasStaked && (
                  <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Your Active Stake:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {vault.userStaked} {vault.symbol}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => onSelectVault(vault)}
                  className="w-full rounded-xl bg-white/10 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary hover:text-black"
                >
                  {hasStaked ? "Add More to Stake" : "Stake Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
