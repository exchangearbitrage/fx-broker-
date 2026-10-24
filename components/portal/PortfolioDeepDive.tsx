"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search, TrendingDown, TrendingUp } from "lucide-react";
import { Sparkline } from "@/components/markets/Sparkline";
import { formatCurrency, formatPercent } from "@/lib/utils";

export type TreasuryAccount = { id: string; type: string; currency: string; balance: number; equity: number; marginUsed: number; freeMargin: number; unrealizedPnl: number };
export type TreasuryPosition = { id: string; symbol: string; side: string; size: number; entryPrice: number; markPrice: number; margin: number; pnl: number };
export type TreasuryStake = { id: string; asset: string; principal: number; accrued: number; baseApy: number; bonusApy: number };

type Holding = { id: string; name: string; symbol: string; category: "cash" | "positions" | "staking"; balance: number; avgPrice: number; currentPrice: number; valueUsd: number; pnl: number; sparkline: number[] };

function nameForSymbol(symbol: string) { return symbol.replace(/USD$/i, " / USD").replace(/([A-Z]+)([A-Z]{3})$/, "$1 / $2"); }

export function PortfolioDeepDive({ accounts, positions, stakes, currency = "USD" }: { accounts: TreasuryAccount[]; positions: TreasuryPosition[]; stakes: TreasuryStake[]; currency?: string }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const holdings = useMemo<Holding[]>(() => {
    const account = accounts[0];
    const cash: Holding[] = account && account.freeMargin > 0 ? [{ id: account.id, name: `${account.type === "DEMO" ? "Demo" : "Live"} account available cash`, symbol: account.currency, category: "cash", balance: account.freeMargin, avgPrice: 1, currentPrice: 1, valueUsd: account.freeMargin, pnl: 0, sparkline: [account.freeMargin, account.freeMargin] }] : [];
    const activePositions = positions.map((position) => ({ id: position.id, name: nameForSymbol(position.symbol), symbol: position.symbol, category: "positions" as const, balance: position.size, avgPrice: position.entryPrice, currentPrice: position.markPrice, valueUsd: Math.max(0, position.margin + position.pnl), pnl: position.pnl, sparkline: [position.entryPrice, position.markPrice] }));
    const activeStakes = stakes.map((stake) => ({ id: stake.id, name: `${stake.asset} staking position`, symbol: stake.asset, category: "staking" as const, balance: stake.principal, avgPrice: 1, currentPrice: 1, valueUsd: stake.principal + stake.accrued, pnl: stake.accrued, sparkline: [stake.principal, stake.principal + stake.accrued] }));
    return [...cash, ...activePositions, ...activeStakes];
  }, [accounts, positions, stakes]);
  const total = holdings.reduce((sum, holding) => sum + holding.valueUsd, 0);
  const totalPnl = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const filtered = holdings.filter((holding) => (filter === "all" || holding.category === filter) && `${holding.name} ${holding.symbol}`.toLowerCase().includes(search.toLowerCase()));
  const categories = ["cash", "positions", "staking"].map((category) => ({ category, value: holdings.filter((item) => item.category === category).reduce((sum, item) => sum + item.valueUsd, 0) })).filter((item) => item.value > 0);

  function exportCsv() {
    const rows = ["Asset,Symbol,Category,Balance,Entry price,Mark price,Value,Unrealized P&L", ...holdings.map((item) => [item.name, item.symbol, item.category, item.balance, item.avgPrice, item.currentPrice, item.valueUsd, item.pnl].map((value) => `\"${value}\"`).join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `assets-statement-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Tracked asset value" value={formatCurrency(total, currency)} detail="Available cash, margin-backed positions, and active staking" />
      <Metric label="Unrealized & accrued P&L" value={`${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl, currency)}`} detail={total > Math.abs(totalPnl) ? formatPercent((totalPnl / (total - totalPnl)) * 100) : "—"} positive={totalPnl >= 0} />
      <button type="button" onClick={exportCsv} className="rounded-2xl border border-white/10 bg-brand-surface p-5 text-left transition-colors hover:bg-white/5"><span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">Statement</span><span className="mt-2 flex items-center gap-2 font-semibold text-white"><Download className="h-4 w-4 text-brand-primary" /> Export current holdings</span><span className="mt-1 block text-xs text-brand-secondary">CSV generated from the visible account data</span></button>
    </div>
    <section className="rounded-2xl border border-white/10 bg-brand-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-heading text-lg font-bold text-white">Holdings & allocation</h2><p className="mt-1 text-xs text-brand-secondary">Current open holdings only. Closed trades remain in the transaction ledger.</p></div><div className="relative"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-secondary" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets" className="rounded-xl border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-xs text-white outline-none focus:border-brand-primary" /></div></div>
      <div className="mt-4 flex flex-wrap gap-2">{["all", "cash", "positions", "staking"].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === item ? "bg-brand-primary text-black" : "bg-white/5 text-brand-secondary hover:text-white"}`}>{item === "all" ? "All assets" : item}</button>)}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{categories.map((item) => <div key={item.category}><div className="flex justify-between text-xs text-brand-secondary"><span className="capitalize">{item.category}</span><span>{total ? ((item.value / total) * 100).toFixed(1) : "0.0"}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-brand-primary" style={{ width: `${total ? (item.value / total) * 100 : 0}%` }} /></div></div>)}</div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-white/10 text-brand-secondary"><tr><th className="p-3">Asset</th><th className="p-3">Type</th><th className="p-3">Quantity</th><th className="p-3">Entry</th><th className="p-3">Mark</th><th className="p-3">Value</th><th className="p-3">P&amp;L</th><th className="p-3">Trend</th><th className="p-3" /></tr></thead><tbody className="divide-y divide-white/5">{filtered.map((item) => <tr key={item.id}><td className="p-3 font-semibold text-white"><div>{item.symbol}</div><div className="mt-0.5 text-[11px] font-normal text-brand-secondary">{item.name}</div></td><td className="p-3 capitalize text-brand-secondary">{item.category}</td><td className="p-3 font-mono text-white">{item.balance.toLocaleString()}</td><td className="p-3 text-brand-secondary">{formatCurrency(item.avgPrice, currency)}</td><td className="p-3 text-white">{formatCurrency(item.currentPrice, currency)}</td><td className="p-3 font-semibold text-white">{formatCurrency(item.valueUsd, currency)}</td><td className={`p-3 font-semibold ${item.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{item.pnl >= 0 ? "+" : ""}{formatCurrency(item.pnl, currency)}</td><td className="p-3"><Sparkline points={item.sparkline} positive={item.pnl >= 0} className="h-7 w-20" /></td><td className="p-3 text-right"><Link href="/dashboard/trade" className="text-brand-primary hover:underline">Trade</Link></td></tr>)}{!filtered.length && <tr><td colSpan={9} className="p-8 text-center text-brand-secondary">No matching holdings in this account yet.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}

function Metric({ label, value, detail, positive }: { label: string; value: string; detail: string; positive?: boolean }) { return <article className="rounded-2xl border border-white/10 bg-brand-surface p-5"><p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">{label}</p><p className={`mt-2 font-mono text-2xl font-bold ${positive === undefined ? "text-white" : positive ? "text-emerald-400" : "text-rose-400"}`}>{positive === false ? <TrendingDown className="mr-1 inline h-5 w-5" /> : positive ? <TrendingUp className="mr-1 inline h-5 w-5" /> : null}{value}</p><p className="mt-1 text-xs text-brand-secondary">{detail}</p></article>; }
