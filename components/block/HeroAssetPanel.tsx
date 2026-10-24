"use client";

import { useMemo, useState } from "react";
import { AssetSwap, ASSETS } from "@/components/block/AssetSwap";
import { Sparkline } from "@/components/markets/Sparkline";
import type { MarketQuote } from "@/lib/market-data/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

import { useTranslation } from "@/context/LanguageContext";

const fallbackChange: Record<string, number> = { BTC: 0.47, ETH: 1.12, SOL: 2.84, USD: 0, EUR: -0.18 };

export function HeroAssetPanel({ quotes, currency }: { quotes: MarketQuote[]; currency: string }) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("BTC");
  const asset = ASSETS.find((item) => item.symbol === symbol) ?? ASSETS[0];
  const liveQuote = useMemo(() => quotes.find((quote) => quote.symbol === symbol), [quotes, symbol]);
  const change = liveQuote?.change24h ?? fallbackChange[symbol] ?? 0;
  const price = liveQuote?.price ?? asset.price;
  const points = liveQuote?.sparkline ?? [price * 0.97, price * 0.98, price * 0.975, price * 0.99, price * 1.01, price * 1.005, price];

  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-[1fr_1.05fr]">
      <AssetSwap onAssetChange={setSymbol} prices={Object.fromEntries(quotes.filter((quote) => ["BTC", "ETH", "SOL"].includes(quote.symbol)).map((quote) => [quote.symbol, quote.price]))} />
      <div className="flex flex-col justify-between rounded-[calc(var(--radius-brand)+14px)] bg-brand-surface p-5 shadow-border min-h-[248px]">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-brand-secondary">{t.selectedMarket ?? "Selected market"}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold text-black" style={{ background: asset.color }}>{symbol.slice(0, 1)}</span>
                <div>
                  <h2 className="font-heading text-xl font-semibold sm:text-2xl">{asset.name}</h2>
                  <p className="text-xs text-brand-secondary sm:text-sm">{symbol} · {t.liveConversion ?? "live conversion reference"}</p>
                </div>
              </div>
            </div>
            <span className={change >= 0 ? "text-sm font-semibold text-brand-success" : "text-sm font-semibold text-brand-danger"}>{formatPercent(change)}</span>
          </div>
          <Sparkline points={points} positive={change >= 0} className="mt-4 h-16 w-full" />
        </div>
        <div className="mt-3 flex items-end justify-between gap-4 border-t border-white/5 pt-3">
          <div>
            <p className="text-xs text-brand-secondary">{t.referencePrice ?? "Reference price"}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{formatCurrency(price, currency)}</p>
          </div>
          <p className="max-w-[170px] text-right text-[11px] leading-4 text-brand-secondary">{t.chartUpdateNotice ?? "Chart and quote update live on asset change."}</p>
        </div>
      </div>
    </div>
  );
}
