"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActionArrowGlyph } from "@/components/icons/TradingGlyphs";
import { Sparkline } from "@/components/markets/Sparkline";
import type { MarketQuote } from "@/lib/market-data/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

import { useTranslation } from "@/context/LanguageContext";

type MarketTableProps = {
  quotes: MarketQuote[];
  currency: string;
  initialCategory?: string;
  pageSize?: number;
};

type SortKey = "symbol" | "price" | "change24h" | "volume";

export function MarketTable({ quotes, currency, initialCategory = "all", pageSize = 8 }: MarketTableProps) {
  const { t } = useTranslation();
  const categories = ["all", ...Array.from(new Set(quotes.map((quote) => quote.category)))];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortKey, setSortKey] = useState<SortKey>("change24h");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return quotes
      .filter((quote) => category === "all" || quote.category === category)
      .filter((quote) => !normalized || quote.symbol.toLowerCase().includes(normalized) || quote.name.toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol);
        return Number(b[sortKey]) - Number(a[sortKey]);
      });
  }, [category, query, quotes, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="w-full rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="w-full rounded-brand bg-brand-background/45">
        <div className="grid gap-2 border-b border-white/10 p-3 sm:grid-cols-[1fr_auto_auto] sm:p-4">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t.searchMarkets ?? "Search markets"}
            className="min-h-10 rounded-brand border border-white/10 bg-brand-surface px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-primary"
          />
          <select value={category} onChange={(event) => updateCategory(event.target.value)} className="min-h-10 rounded-brand border border-white/10 bg-brand-surface px-3 text-xs sm:min-h-11 sm:text-sm">
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? (t.allMarkets ?? "All markets") : item.toUpperCase()}
              </option>
            ))}
          </select>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="min-h-10 rounded-brand border border-white/10 bg-brand-surface px-3 text-xs sm:min-h-11 sm:text-sm">
            <option value="change24h">Sort by 24h</option>
            <option value="price">Sort by price</option>
            <option value="volume">Sort by volume</option>
            <option value="symbol">Sort by symbol</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-brand-secondary">
              <tr>
                <th className="px-3 py-3 font-semibold sm:px-4">{t.market ?? "Market"}</th>
                <th className="px-3 py-3 font-semibold sm:px-4">{t.price ?? "Price"}</th>
                <th className="px-2 py-3 font-semibold sm:px-4">24h</th>
                <th className="hidden px-4 py-3 font-semibold xl:table-cell">Range</th>
                <th className="hidden px-2 py-3 font-semibold sm:table-cell sm:px-4">{t.trend ?? "Trend"}</th>
                <th className="px-3 py-3 text-right font-semibold sm:px-4 sm:text-left">{t.action ?? "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((quote) => (
                <tr key={quote.symbol} className="border-t border-white/10 transition-colors hover:bg-white/[0.02]">
                  <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                    <Link href={`/markets/${quote.symbol}`} className="group inline-flex flex-col">
                      <span className="font-semibold group-hover:text-brand-primary">{quote.symbol}</span>
                      <span className="text-[11px] text-brand-secondary">{quote.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-medium tabular-nums sm:px-4 sm:py-3.5">{formatCurrency(quote.price, currency)}</td>
                  <td className={cn("px-2 py-3 font-semibold tabular-nums sm:px-4 sm:py-3.5", quote.change24h >= 0 ? "text-brand-success" : "text-brand-danger")}>{formatPercent(quote.change24h)}</td>
                  <td className="hidden px-4 py-3 text-[11px] text-brand-secondary tabular-nums xl:table-cell sm:py-3.5">
                    {formatCurrency(quote.low24h, currency)} / {formatCurrency(quote.high24h, currency)}
                  </td>
                  <td className="hidden px-2 py-3 sm:table-cell sm:px-4 sm:py-3.5">
                    <Sparkline points={quote.sparkline} positive={quote.change24h >= 0} className="h-7 w-20 sm:h-8 sm:w-24" />
                  </td>
                  <td className="px-3 py-3 text-right sm:px-4 sm:py-3.5 sm:text-left">
                    <Link href={`/trade?symbol=${quote.symbol}`} className="inline-flex items-center gap-1.5 rounded-brand bg-brand-primary px-2.5 py-1.5 text-xs font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
                      {t.trade ?? "Trade"}
                      <ActionArrowGlyph className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length ? null : <p className="p-8 text-center text-sm text-brand-secondary">No markets match your filters.</p>}

        <div className="flex items-center justify-between border-t border-white/10 p-4 text-sm text-brand-secondary">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-brand px-3 py-2 shadow-border transition-[opacity,scale] duration-150 active:scale-[0.96] disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={page === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))} className="rounded-brand px-3 py-2 shadow-border transition-[opacity,scale] duration-150 active:scale-[0.96] disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
