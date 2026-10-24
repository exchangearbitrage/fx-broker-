"use client";

import { useEffect, useState } from "react";
import { MarketTable } from "@/components/markets/MarketTable";
import type { MarketQuote } from "@/lib/market-data/types";

type LiveMarketTableProps = {
  quotes: MarketQuote[];
  currency: string;
  initialCategory?: string;
  pageSize?: number;
};

export function LiveMarketTable(props: LiveMarketTableProps) {
  const [quotes, setQuotes] = useState(props.quotes);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cacheKey = `pb-market-quotes:${props.initialCategory ?? "all"}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { quotes: MarketQuote[]; updatedAt: string; savedAt: number };
        if (Date.now() - parsed.savedAt < 60_000) {
          setQuotes(parsed.quotes);
          setUpdatedAt(parsed.updatedAt);
        }
      } catch { window.sessionStorage.removeItem(cacheKey); }
    }

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      const response = await fetch("/api/markets/quotes", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { quotes?: MarketQuote[]; updatedAt?: string };
      if (!cancelled && data.quotes?.length) {
        setQuotes(data.quotes);
        setUpdatedAt(data.updatedAt ?? null);
        window.sessionStorage.setItem(cacheKey, JSON.stringify({ quotes: data.quotes, updatedAt: data.updatedAt ?? new Date().toISOString(), savedAt: Date.now() }));
      }
    }

    const visibilityRefresh = () => { if (document.visibilityState === "visible") void refresh(); };
    if (!cached) void refresh();
    document.addEventListener("visibilitychange", visibilityRefresh);
    const interval = window.setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibilityRefresh);
    };
  }, [props.initialCategory]);

  return (
    <div className="space-y-3">
      {updatedAt ? (
        <div className="flex items-center justify-end text-xs text-brand-secondary">
          <span>{new Date(updatedAt).toLocaleTimeString()}</span>
        </div>
      ) : null}
      <MarketTable {...props} quotes={quotes} />
    </div>
  );
}
