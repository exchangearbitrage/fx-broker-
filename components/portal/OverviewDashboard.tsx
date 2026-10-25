"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BriefcaseBusiness, RefreshCw, Wallet } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

type Account = {
  id: string;
  type: string;
  balance: number;
  equity: number;
  freeMargin: number;
  marginUsed: number;
  unrealizedPnl: number;
};
type Position = { id: string; symbol: string; side: string; size: number; pnl: number };
type Transaction = { id: string; type: string; asset: string; amountUsd: number; status: string; createdAt: string };
type Summary = { accounts: Account[]; positions: Position[]; transactions: Transaction[] };

export function OverviewDashboard({ firstName }: { firstName?: string | null }) {
  const { formatMoney } = useCurrency();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/assets/summary", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load account summary");
      setData(await response.json());
    } catch {
      setError("We couldn’t load your account overview. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const liveAccount = useMemo(() => data?.accounts.find((account) => account.type === "LIVE"), [data]);
  const demoAccount = useMemo(() => data?.accounts.find((account) => account.type === "DEMO"), [data]);
  const totalEquity = useMemo(() => data?.accounts.reduce((total, account) => total + account.equity, 0) ?? 0, [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Account overview</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-white">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
          <p className="mt-2 text-sm text-brand-secondary">A live summary of your accounts, open positions, and latest activity.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </header>

      {error ? <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-danger">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Combined account equity" value={formatMoney(totalEquity)} icon={Wallet} loading={loading} />
        <MetricCard label="Live balance" value={formatMoney(liveAccount?.balance ?? 0)} icon={BriefcaseBusiness} loading={loading} />
        <MetricCard label="Demo balance" value={formatMoney(demoAccount?.balance ?? 0)} icon={BriefcaseBusiness} loading={loading} />
        <MetricCard label="Live available margin" value={formatMoney(liveAccount?.freeMargin ?? 0)} icon={Activity} loading={loading} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border border-white/10 bg-brand-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Open positions</h2>
              <p className="mt-1 text-xs text-brand-secondary">Current positions from your live account.</p>
            </div>
            <Link href="/dashboard/portfolio" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">
              View assets <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="mt-5 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-xs">
              <thead className="border-b border-white/10 text-brand-secondary">
                <tr>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Size</th>
                  <th className="p-3 text-right">Open P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.positions.map((position) => (
                  <tr key={position.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-semibold text-white">{position.symbol}</td>
                    <td className="p-3 capitalize text-brand-secondary">{position.side}</td>
                    <td className="p-3 text-white">{position.size.toLocaleString()}</td>
                    <td className={`p-3 text-right font-semibold ${position.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {position.pnl >= 0 ? "+" : ""}{formatMoney(position.pnl)}
                    </td>
                  </tr>
                ))}
                {!loading && !data?.positions.length ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-brand-secondary">
                      No open positions yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Mobile Position Cards */}
          <div className="mt-4 block md:hidden space-y-2.5">
            {data?.positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{position.symbol}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      position.side.toLowerCase() === "buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {position.side.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-secondary">Size: {position.size.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-brand-secondary">Open P&amp;L</p>
                  <p className={`font-mono text-sm font-bold ${position.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {position.pnl >= 0 ? "+" : ""}{formatMoney(position.pnl)}
                  </p>
                </div>
              </div>
            ))}
            {!loading && !data?.positions.length ? (
              <p className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-brand-secondary">
                No open positions yet.
              </p>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-brand-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Recent activity</h2>
              <p className="mt-1 text-xs text-brand-secondary">Latest account ledger events.</p>
            </div>
            <Link href="/dashboard/portfolio?tab=ledger" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">
              Ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 sm:mt-5 space-y-2.5">
            {data?.transactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">{transaction.type.replaceAll("_", " ")}</p>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-brand-secondary">
                      {transaction.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-secondary">
                    {new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className={`shrink-0 font-mono text-sm font-semibold ${transaction.amountUsd >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {transaction.amountUsd >= 0 ? "+" : ""}{formatMoney(transaction.amountUsd)}
                </p>
              </div>
            ))}
            {!loading && !data?.transactions.length ? (
              <p className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-brand-secondary">
                No account activity yet.
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, loading, positive }: { label: string; value: string; icon: typeof Wallet; loading: boolean; positive?: boolean }) {
  return <article className="rounded-2xl border border-white/10 bg-brand-surface p-5"><Icon className="h-5 w-5 text-brand-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-secondary">{label}</p><p className={`mt-2 font-mono text-2xl font-bold ${positive === false ? "text-rose-400" : positive ? "text-emerald-400" : "text-white"}`}>{loading ? "—" : value}</p></article>;
}
