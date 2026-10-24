"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market-data/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function LiveTicker({ quotes, currency }: { quotes: MarketQuote[]; currency: string }) {
  const [items, setItems] = useState(quotes);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const response = await fetch("/api/markets/quotes", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { quotes?: MarketQuote[] };
      if (!cancelled && data.quotes?.length) setItems(data.quotes);
    }

    const interval = window.setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const loop = items.concat(items, items);

  return (
    <div className="overflow-hidden border-y border-white/10 bg-brand-surface/55">
      <div className="ticker-track flex w-max gap-7 px-4 py-3 text-sm text-brand-secondary">
        {loop.map((quote, index) => (
          <Link key={`${quote.symbol}-${index}`} href={`/markets/${quote.symbol}`} className="flex shrink-0 items-center gap-2">
            <span className="font-semibold text-brand-text">{quote.symbol}</span>
            <span>{formatCurrency(quote.price, currency)}</span>
            <span className={quote.change24h >= 0 ? "text-brand-success" : "text-brand-danger"}>{formatPercent(quote.change24h)}</span>
            {quote.source === "live" ? <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-primary">Live</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
