"use client";

import { Bitcoin, Globe, TrendingUp, Layers, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AssetClass {
  name: string;
  category: string;
  share: number;
  value: number;
  color: string;
  icon: typeof Bitcoin;
  return24h: number;
}

export function AssetAllocation({ totalValue, currency = "USD" }: { totalValue: number; currency?: string }) {
  const allocations: AssetClass[] = [
    {
      name: "Crypto Assets",
      category: "crypto",
      share: 45,
      value: totalValue * 0.45,
      color: "#F7931A",
      icon: Bitcoin,
      return24h: 3.4,
    },
    {
      name: "Forex & Currencies",
      category: "forex",
      share: 20,
      value: totalValue * 0.20,
      color: "#00FF61",
      icon: Globe,
      return24h: 0.8,
    },
    {
      name: "Blue-Chip Shares",
      category: "shares",
      share: 18,
      value: totalValue * 0.18,
      color: "#3B82F6",
      icon: TrendingUp,
      return24h: 1.9,
    },
    {
      name: "Commodities & Gold",
      category: "commodities",
      share: 12,
      value: totalValue * 0.12,
      color: "#EAB308",
      icon: Layers,
      return24h: 1.1,
    },
    {
      name: "Cash & USD Stable",
      category: "cash",
      share: 5,
      value: totalValue * 0.05,
      color: "#8B5CF6",
      icon: DollarSign,
      return24h: 0.0,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Multi-Asset Allocation
          </span>
          <h3 className="font-heading text-lg font-bold text-white">Portfolio Distribution</h3>
        </div>
        <span className="text-xs font-mono text-brand-secondary">5 Asset Classes</span>
      </div>

      {/* Multi-segmented distribution bar */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/5 p-0.5">
        {allocations.map((asset) => (
          <div
            key={asset.name}
            style={{ width: `${asset.share}%`, backgroundColor: asset.color }}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
            title={`${asset.name}: ${asset.share}%`}
          />
        ))}
      </div>

      {/* Asset class chips list */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
        {allocations.map((asset) => {
          const Icon = asset.icon;
          return (
            <div
              key={asset.name}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-black"
                  style={{ backgroundColor: asset.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">{asset.name}</span>
                    <span className="text-[11px] font-mono text-brand-secondary">({asset.share}%)</span>
                  </div>
                  <span className="text-[10px] text-brand-secondary">
                    {asset.return24h > 0 ? `+${asset.return24h}% today` : "Steady"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-semibold text-white">
                  {formatCurrency(asset.value, currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
