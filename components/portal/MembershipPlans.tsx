"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";
import { useCurrency } from "@/context/CurrencyContext";

type Plan = {
  id: string;
  name: string;
  price: number;
  stakingApyBonus: number;
  tradingFeeDiscount: number;
  hasAccountManager: boolean;
  badgeLabel: string;
  demoAllocation: number;
  maxStakingAssets: number;
  maxCopyProviders: number;
};

type PurchaseNotice = { planId: string; kind: "error" | "success"; text: string };

export function MembershipPlans() {
  const { currency, formatMoney } = useCurrency();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState<PurchaseNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setPageError("");
    try {
      const response = await fetch("/api/membership", { cache: "no-store" });
      if (!response.ok) {
        setPageError("We couldn’t load membership packages. Refresh the page or contact support if this keeps happening.");
        return;
      }
      const data = await response.json();
      setPlans(data.plans ?? []);
      setCurrentPlan(data.currentPlan ?? null);
      setLiveBalance(typeof data.liveBalance === "number" ? data.liveBalance : null);
    } catch {
      setPageError("We couldn’t load membership packages. Check your connection and try again, or contact support for help.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const purchase = async (plan: Plan) => {
    setPurchasingId(plan.id);
    setNotice(null);
    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setNotice({
          planId: plan.id,
          kind: "error",
          text: data?.error ?? "We couldn’t activate this plan. Your wallet was not charged. Please try again, or contact support if this keeps happening.",
        });
        return;
      }
      setNotice({ planId: plan.id, kind: "success", text: `${plan.name} is now active and the price was paid from your Live wallet.` });
      await load();
    } catch {
      setNotice({ planId: plan.id, kind: "error", text: "We couldn’t reach the payment service. Your wallet was not charged. Please try again, or contact support if this keeps happening." });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-brand-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px]" />
      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Membership benefits</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-white">Choose your trading plan</h1>
        <p className="mt-2 text-sm text-brand-secondary">Active plan: <span className="font-semibold text-brand-primary">{currentPlan?.name ?? (loading ? "Loading…" : "Not selected")}</span></p>
        {liveBalance !== null ? <p className="mt-1 text-xs text-brand-secondary">Live wallet: <span className="font-semibold text-white">{formatMoney(liveBalance, { currency: "USD" })}</span>{currency !== "USD" ? ` (≈ ${formatMoney(liveBalance)})` : ""}</p> : null}
        {pageError ? <p role="status" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{pageError}</p> : null}

        <div className="relative grid gap-6 py-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const featured = currentPlan?.id === plan.id || plan.badgeLabel.toLowerCase().includes("pro") || plan.badgeLabel.toLowerCase().includes("popular");
            const insufficient = liveBalance !== null && plan.price > liveBalance;
            const planNotice = notice?.planId === plan.id ? notice : null;
            return (
              <article key={plan.id} className={`${featured ? "glass-card-featured" : "glass-card-premium"} flex min-h-[410px] h-full flex-col p-7`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{plan.badgeLabel}</span>
                  {currentPlan?.id === plan.id ? <span className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black">Active</span> : null}
                </div>
                <h2 className="mt-5 text-lg font-bold text-white">{plan.name}</h2>
                <p className="mt-2 font-mono text-4xl font-extrabold tracking-tight text-white">{formatMoney(plan.price, { currency: "USD" })}<span className="ml-1 text-sm font-medium text-brand-secondary">/ plan</span></p>
                {currency !== "USD" ? <p className="mt-1 text-xs text-brand-secondary">≈ {formatMoney(plan.price)}</p> : null}
                <p className="mt-3 text-xs leading-relaxed text-brand-secondary">Paid directly from your Live wallet. Deposit funds first if your balance is insufficient.</p>
                <ul className="mt-7 space-y-3">
                  <Benefit text={`${formatMoney(plan.demoAllocation)} demo allocation`} />
                  <Benefit text={`+${plan.stakingApyBonus}% staking APY boost`} />
                  <Benefit text={`${plan.tradingFeeDiscount}% trading-fee discount`} />
                  <Benefit text={`Access to ${plan.maxStakingAssets} staking assets`} />
                  <Benefit text={`Copy up to ${plan.maxCopyProviders} strategy ${plan.maxCopyProviders === 1 ? "provider" : "providers"}`} />
                  <Benefit text={plan.hasAccountManager ? "Dedicated personal account manager" : "Standard support"} />
                </ul>
                {insufficient ? (
                  <Link href="/dashboard/wallet" className="mt-auto block w-full rounded-full border border-brand-primary px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-brand-primary">Deposit to choose plan</Link>
                ) : (
                  <button disabled={currentPlan?.id === plan.id || purchasingId !== null} type="button" onClick={() => void purchase(plan)} className="mt-auto w-full rounded-full bg-white py-3.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg transition-all duration-150 hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98] disabled:cursor-default disabled:opacity-50">{currentPlan?.id === plan.id ? "Current plan" : purchasingId === plan.id ? "Charging wallet…" : "Pay from Live wallet"}</button>
                )}
                {planNotice ? <p role="status" aria-live="polite" className={`mt-3 text-xs leading-5 ${planNotice.kind === "error" ? "text-rose-200" : "text-brand-primary"}`}>{planNotice.text}{planNotice.kind === "error" && !planNotice.text.toLowerCase().includes("deposit") ? <Link className="ml-1 font-semibold underline" href="/dashboard/assistance">Contact support</Link> : null}</p> : null}
              </article>
            );
          })}
        </div>
        {!loading && plans.length === 0 ? <div className="rounded-2xl border border-white/10 bg-brand-surface p-8 text-center text-sm text-brand-secondary">No membership packages are configured yet.</div> : null}
        <CurrencyDisclosure />
      </div>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return <li className="flex items-start gap-3 text-xs text-white/90"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-brand-primary"><Check className="h-3 w-3 stroke-[2.5]" /></span><span>{text}</span></li>;
}
