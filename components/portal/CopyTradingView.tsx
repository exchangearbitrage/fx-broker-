"use client";

import { useState } from "react";
import { Lock, Pause, Play, X } from "lucide-react";
import { useCopyTrading, type CopyProvider } from "@/lib/services/copyTrading";
import { useCurrency } from "@/context/CurrencyContext";
import { MembershipGateModal } from "./MembershipGateModal";
import { useDismissibleModal } from "@/components/ui/useDismissibleModal";

export function CopyTradingView() {
  const { formatMoney } = useCurrency();
  const { providers, subscriptions, entitlements, isLoading: loading, error, copyProvider, pauseSubscription, resumeSubscription, revokeSubscription } = useCopyTrading();
  const [selected, setSelected] = useState<CopyProvider | null>(null);
  const [amount, setAmount] = useState(500);
  const [drawdown, setDrawdown] = useState(15);
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  useDismissibleModal(selected !== null, () => setSelected(null));
  const totalAllocated = subscriptions.filter((item) => item.status !== "REVOKED").reduce((sum, item) => sum + item.allocatedAmount, 0);

  async function confirmCopy() {
    if (!selected) return;
    setSubmitting(true); setActionError("");
    try { await copyProvider(selected, amount, drawdown); setSelected(null); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Unable to start copying this strategy."); }
    finally { setSubmitting(false); }
  }

  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Strategy allocation</p><h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Copy Trading</h1><p className="mt-1 text-xs text-brand-secondary">Allocate Live-account capital to approved strategy subscriptions. Allocated capital is reserved from your available margin until you stop copying.</p></div>
    {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Capital reserved" value={formatMoney(totalAllocated)} hint={`${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"}`} /><Stat label="Strategy access" value={entitlements ? `${entitlements.maxCopyProviders} provider${entitlements.maxCopyProviders === 1 ? "" : "s"}` : "—"} hint={entitlements ? `${entitlements.planName} membership` : "Loading membership"} /><Stat label="Risk controls" value="Per strategy" hint="Drawdown limit chosen on activation" /></div>
    <section className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6"><div className="border-b border-white/10 pb-4"><h2 className="font-heading text-lg font-bold text-white">Your subscriptions</h2><p className="text-xs text-brand-secondary">Pause keeps the allocation reserved. Stopping a subscription releases it to your Live available margin.</p></div>
      {!loading && subscriptions.length === 0 ? <p className="py-8 text-center text-sm text-brand-secondary">No strategy is active yet.</p> : <div className="divide-y divide-white/10">{subscriptions.map((sub) => <div key={sub.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-white">{sub.providerName} <span className="ml-2 text-xs text-brand-secondary">{sub.providerHandle}</span></p><p className="mt-1 text-xs text-brand-secondary">{formatMoney(sub.allocatedAmount)} reserved · {sub.maxDrawdown}% max drawdown · started {new Date(sub.startedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button type="button" onClick={() => sub.status === "ACTIVE" ? pauseSubscription(sub.id) : resumeSubscription(sub.id)} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white">{sub.status === "ACTIVE" ? <><Pause className="mr-1 inline h-3.5 w-3.5"/>Pause</> : <><Play className="mr-1 inline h-3.5 w-3.5"/>Resume</>}</button><button type="button" onClick={() => revokeSubscription(sub.id)} className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300"><X className="mr-1 inline h-3.5 w-3.5"/>Stop</button></div></div>)}</div>}
    </section>
    <section className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6"><div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"><div><h2 className="font-heading text-lg font-bold text-white">Strategy directory</h2><p className="text-xs text-brand-secondary">Access is controlled by your current membership and also enforced by the server.</p></div>{providers.some((provider) => !provider.allowed) && <button type="button" onClick={() => setGateOpen(true)} className="text-xs font-bold text-brand-primary">View more strategies</button>}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{providers.map((provider) => <article key={provider.id} className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/15 p-4"><div><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{provider.name}</h3><p className="text-xs text-brand-secondary">{provider.handle} · Risk {provider.riskScore}/5</p></div>{!provider.allowed && <Lock className="h-4 w-4 text-amber-300"/>}</div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><Metric label="30d ROI" value={`+${provider.roi30d}%`} /><Metric label="Win rate" value={`${provider.winRate}%`} /></div><p className="mt-3 text-xs text-brand-secondary">{provider.description}</p></div><button type="button" onClick={() => provider.allowed ? (setActionError(""), setSelected(provider)) : setGateOpen(true)} className="mt-4 rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-black">{provider.allowed ? "Copy strategy" : "Unlock strategy"}</button></article>)}</div>
    </section>
    {selected && <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-white/15 bg-brand-surface p-6 shadow-2xl"><div className="flex justify-between"><div><h2 className="font-heading text-lg font-bold text-white">Copy {selected.name}</h2><p className="text-xs text-brand-secondary">Your allocation is reserved from Live available margin.</p></div><button type="button" onClick={() => setSelected(null)} className="text-brand-secondary"><X/></button></div><label className="mt-5 block text-xs text-brand-secondary">Allocation (USD)<input type="number" min="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-white/15 bg-black/20 p-3 text-white"/></label><label className="mt-3 block text-xs text-brand-secondary">Maximum drawdown (%)<input type="number" min="0" max="100" value={drawdown} onChange={(event) => setDrawdown(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-white/15 bg-black/20 p-3 text-white"/></label>{actionError && <p className="mt-3 text-xs text-rose-300">{actionError}</p>}<button type="button" disabled={submitting} onClick={confirmCopy} className="mt-5 w-full rounded-lg bg-brand-primary p-3 text-sm font-bold text-black disabled:opacity-50">{submitting ? "Starting…" : "Start copying"}</button></div></div>}
    <MembershipGateModal open={gateOpen} onClose={() => setGateOpen(false)} feature="more copy strategies" />
  </div>;
}
function Stat({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">{label}</p><p className="mt-2 font-mono text-2xl font-extrabold text-white">{value}</p><p className="mt-1 text-xs text-brand-secondary">{hint}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-white/5 p-2"><p className="text-[10px] uppercase text-brand-secondary">{label}</p><p className="font-mono font-bold text-emerald-400">{value}</p></div>; }