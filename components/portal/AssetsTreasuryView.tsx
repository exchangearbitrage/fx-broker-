"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Landmark, RefreshCw, QrCode, CreditCard, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { ManualPaymentForm } from "@/components/portal/ManualPaymentForm";
import { AccountModeSwitcher } from "@/components/portal/AccountModeSwitcher";
import { PortfolioDeepDive, type TreasuryAccount, type TreasuryPosition, type TreasuryStake } from "@/components/portal/PortfolioDeepDive";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

type AccountType = "LIVE" | "DEMO";
type Transaction = { id: string; type: string; asset: string; amount: number; amountUsd: number; status: string; txHash?: string | null; createdAt: string };
type Summary = { accounts: TreasuryAccount[]; positions: TreasuryPosition[]; stakes: TreasuryStake[]; transactions: Transaction[] };
const tabs = [{ id: "holdings", label: "Holdings & Allocation" }, { id: "funding", label: "Deposit & Funding" }, { id: "ledger", label: "Transaction Ledger" }, { id: "balances", label: "Account Balances" }] as const;
type Tab = (typeof tabs)[number]["id"];

export function AssetsTreasuryView({ currency: initialCurrency = "USD" }: { currency?: string }) {
  const { currency: selectedCurrency } = useCurrency();
  const currency = selectedCurrency || initialCurrency;
  const router = useRouter(); const pathname = usePathname() ?? "/dashboard/portfolio"; const searchParams = useSearchParams();
  const requestedTab = searchParams?.get("tab"); const tab: Tab = tabs.some((item) => item.id === requestedTab) ? requestedTab as Tab : "holdings";
  const accountType: AccountType = searchParams?.get("account") === "DEMO" ? "DEMO" : "LIVE";
  const [data, setData] = useState<Summary | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await fetch(`/api/assets/summary?accountType=${accountType}`, { cache: "no-store" }); if (!response.ok) throw new Error(); setData(await response.json()); } catch { setError("We couldn’t refresh your account data. Please try again."); } finally { setLoading(false); } }, [accountType]);
  useEffect(() => { void load(); }, [load]);
  function setParams(next: { tab?: Tab; account?: AccountType }) { const params = new URLSearchParams(searchParams?.toString() ?? ""); if (next.tab) params.set("tab", next.tab); if (next.account) params.set("account", next.account); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); }
  const account = data?.accounts[0];
  return <div className="space-y-6"><header className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Assets & treasury</p><h1 className="mt-1 font-heading text-3xl font-bold text-white">Assets & Treasury Management</h1><p className="mt-2 max-w-3xl text-sm text-brand-secondary">Your {accountType.toLowerCase()} account’s balances, holdings, and ledger activity.</p></div><div className="flex flex-wrap items-center gap-2"><AccountModeSwitcher value={accountType} onChange={(account) => setParams({ account })} /><button onClick={() => setParams({ tab: "funding" })} type="button" disabled={accountType === "DEMO"} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"><ArrowDownToLine className="h-4 w-4" /> Deposit funds</button><button onClick={() => setParams({ tab: "ledger" })} type="button" disabled={accountType === "DEMO"} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><ArrowUpFromLine className="h-4 w-4" /> Request withdrawal</button></div></header>
    <div className="flex overflow-x-auto border-b border-white/10" role="tablist">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setParams({ tab: item.id })} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === item.id ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-secondary hover:text-white"}`}>{item.label}</button>)}</div>
    {accountType === "DEMO" ? <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">Demo balances, positions, and trade activity are isolated from your Live account. Deposits and withdrawals are unavailable in Demo mode.</div> : null}
    {error ? <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-danger">{error}</div> : null}
    {loading ? <div className="rounded-2xl border border-white/10 bg-brand-surface p-10 text-center text-sm text-brand-secondary">Loading your {accountType.toLowerCase()} account…</div> : null}
    {!loading && data && <>{tab === "holdings" && <PortfolioDeepDive accounts={data.accounts} positions={data.positions} stakes={data.stakes} currency={currency} />}{tab === "funding" && (accountType === "LIVE" ? <FundingPanel onSubmitted={load} /> : <DemoNotice />)}{tab === "ledger" && (accountType === "LIVE" ? <LedgerPanel transactions={data.transactions} liveBalance={account?.freeMargin ?? 0} currency={currency} onRequested={load} /> : <LedgerTable transactions={data.transactions} currency={currency} />)}{tab === "balances" && <BalancesPanel account={account} currency={currency} onRefresh={load} />}</>}</div>;
}

function DemoNotice() { return <section className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-6"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Demo account</p><h2 className="mt-1 font-heading text-xl font-bold text-white">Virtual funds stay separate</h2><p className="mt-2 text-sm leading-6 text-brand-secondary">Demo allocations are for practice only. They cannot be funded, withdrawn, or combined with your Live account.</p></section>; }
function FundingPanel({ onSubmitted }: { onSubmitted: () => void }) { return <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/[0.04] p-6"><p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Fund your Live account</p><h2 className="mt-1 font-heading text-xl font-bold text-white">Submit a deposit payment</h2><p className="mt-2 text-sm leading-6 text-brand-secondary">Choose your payment method, then submit your receipt or reference. Your available Live balance changes only after processing is complete.</p><ManualPaymentForm kind="DEPOSIT" onSubmitted={onSubmitted} /></div><aside className="rounded-2xl border border-white/10 bg-brand-surface p-6"><Landmark className="h-5 w-5 text-brand-primary" /><h3 className="mt-3 font-heading text-lg font-bold text-white">Separate account modes</h3><p className="mt-2 text-sm leading-6 text-brand-secondary">Deposits are applied to your Live account after manual processing. Demo funds are isolated and cannot be deposited, withdrawn, or combined with Live capital.</p></aside></section>; }

const withdrawCryptoOptions = [
  { key: "usdtTrc20", label: "USDT (TRC-20)", symbol: "USDT", network: "Tron TRC-20" },
  { key: "usdtErc20", label: "USDT (ERC-20)", symbol: "USDT", network: "ERC-20 (Ethereum)" },
  { key: "btc", label: "Bitcoin", symbol: "BTC", network: "Bitcoin Mainnet" },
  { key: "eth", label: "Ethereum", symbol: "ETH", network: "ERC-20 (Ethereum)" },
  { key: "sol", label: "Solana", symbol: "SOL", network: "Solana Mainnet" },
] as const;

function LedgerPanel({ transactions, liveBalance, currency, onRequested }: { transactions: Transaction[]; liveBalance: number; currency: string; onRequested: () => void }) {
  const [method, setMethod] = useState<"WIRE" | "CRYPTO">("WIRE");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("usdtTrc20");
  const [amount, setAmount] = useState("");

  // Bank fields
  const [bankName, setBankName] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  // Crypto field
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const activeCrypto = withdrawCryptoOptions.find((c) => c.key === selectedCrypto) ?? withdrawCryptoOptions[0];

  async function request(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!(value > 0) || value > liveBalance) {
      setIsSuccess(false);
      setMessage("Enter an amount within your available Live free margin.");
      return;
    }

    let destinationSummary = "";
    let assetLabel = "USD";

    if (method === "WIRE") {
      if (!beneficiaryName.trim() || !iban.trim() || !swift.trim() || !bankName.trim()) {
        setIsSuccess(false);
        setMessage("Please fill out all required bank details (Bank, Beneficiary, IBAN/Account, SWIFT).");
        return;
      }
      destinationSummary = `Bank Wire: ${bankName.trim()} | Beneficiary: ${beneficiaryName.trim()} | IBAN: ${iban.trim()} | SWIFT: ${swift.trim()}${routingNumber.trim() ? ` | Routing: ${routingNumber.trim()}` : ""}`;
      assetLabel = "USD";
    } else {
      if (!cryptoAddress.trim()) {
        setIsSuccess(false);
        setMessage(`Please enter your receiving ${activeCrypto.label} address.`);
        return;
      }
      destinationSummary = `${activeCrypto.label} (${activeCrypto.network}): ${cryptoAddress.trim()}`;
      assetLabel = activeCrypto.symbol;
    }

    setBusy(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/wallet/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "WITHDRAWAL", asset: assetLabel, amount: value, txHash: destinationSummary })
      });
      setBusy(false);
      if (response.ok) {
        setIsSuccess(true);
        setAmount("");
        setCryptoAddress("");
        setBeneficiaryName("");
        setBankName("");
        setIban("");
        setSwift("");
        setRoutingNumber("");
        setMessage("Withdrawal request recorded successfully. Our treasury compliance team will review and disburse your funds.");
        onRequested();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(errorData?.error ?? "We couldn’t record that withdrawal request. Please check your details and try again.");
      }
    } catch {
      setBusy(false);
      setMessage("A network error occurred while submitting. Please try again.");
    }
  }

  const gasFee = method === "CRYPTO" ? (activeCrypto.symbol === "BTC" ? 5 : activeCrypto.symbol === "ETH" ? 4 : 1) : 0;
  const netPayout = Math.max(0, (parseFloat(amount) || 0) - gasFee);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
      <LedgerTable transactions={transactions} currency={currency} />
      <form onSubmit={request} className="rounded-2xl border border-white/10 bg-brand-surface p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Withdrawal request</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-white">Request Live Capital Withdrawal</h2>
          <p className="mt-1 text-xs leading-5 text-brand-secondary">
            Available free margin: <span className="font-mono font-bold text-emerald-400">{formatCurrency(liveBalance, currency)}</span>
          </p>
        </div>

        {/* Method selector tabs matching deposit */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Withdrawal Channel
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "WIRE" as const, label: "Bank Wire", icon: Landmark },
              { id: "CRYPTO" as const, label: "Crypto Transfer", icon: QrCode },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id);
                  setMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
                  method === id
                    ? "border-brand-primary bg-brand-primary/15 text-brand-primary shadow-inner"
                    : "border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic method inputs */}
        {method === "WIRE" && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2.5 text-xs">
            <span className="font-semibold text-white block">Bank Details</span>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-brand-secondary">Beneficiary Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-brand-secondary">Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-brand-secondary">Account Number / IBAN *</label>
                <input
                  type="text"
                  placeholder="e.g. GB29BARC20041538153401"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-brand-secondary">SWIFT / BIC *</label>
                <input
                  type="text"
                  placeholder="e.g. CHASUS33"
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-brand-secondary">Routing Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 021000021"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {method === "CRYPTO" && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2.5 text-xs">
            <span className="font-semibold text-white block">Select Crypto Asset</span>
            <div className="flex flex-wrap gap-1.5">
              {withdrawCryptoOptions.map((opt) => {
                const isSelected = selectedCrypto === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedCrypto(opt.key)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-brand-primary text-black font-bold"
                        : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <label className="block text-brand-secondary">
                Your {activeCrypto.label} Destination Address ({activeCrypto.network}) *
              </label>
              <input
                type="text"
                placeholder={
                  activeCrypto.key === "usdtTrc20"
                    ? "Enter Tron TRC-20 address (T...)"
                    : activeCrypto.key === "btc"
                    ? "Enter Bitcoin address"
                    : activeCrypto.key === "sol"
                    ? "Enter Solana address"
                    : "Enter ERC-20 address (0x...)"
                }
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-xs text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="flex justify-between text-xs">
            <label className="font-semibold text-brand-secondary">Withdrawal Amount (USD) *</label>
            <button
              type="button"
              onClick={() => setAmount(liveBalance.toFixed(2))}
              className="text-brand-primary hover:underline font-semibold"
            >
              Max All ({formatCurrency(liveBalance, currency)})
            </button>
          </div>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            min="0.01"
            step="0.01"
            type="number"
            required
            placeholder="0.00"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
          />
        </div>

        {/* Processing summary */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-brand-secondary space-y-1">
          <div className="flex justify-between">
            <span>Processing Time:</span>
            <span className="text-white font-medium">
              {method === "CRYPTO" ? "Instant (5-15 mins)" : "1-2 Business Days"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Net Disbursal:</span>
            <span className="text-emerald-400 font-mono font-bold">
              ${netPayout.toFixed(2)}
            </span>
          </div>
        </div>

        {message && (
          <p className={`text-xs ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
            {message}
          </p>
        )}

        <button
          disabled={busy || !amount || Number(amount) <= 0 || Number(amount) > liveBalance}
          className="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50 transition-all hover:brightness-105"
        >
          {busy ? "Submitting request…" : "Submit withdrawal request"}
        </button>
      </form>
    </div>
  );
}
function LedgerTable({ transactions, currency }: { transactions: Transaction[]; currency: string }) { return <section className="rounded-2xl border border-white/10 bg-brand-surface p-5"><h2 className="font-heading text-lg font-bold text-white">Transaction ledger</h2><p className="mt-1 text-xs text-brand-secondary">Activity for the selected account only.</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b border-white/10 text-brand-secondary"><tr><th className="p-3">Event</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Reference</th><th className="p-3 text-right">Time</th></tr></thead><tbody className="divide-y divide-white/5">{transactions.map((item) => <tr key={item.id}><td className="p-3 font-semibold text-white">{item.type.replaceAll("_", " ")}</td><td className={`p-3 font-mono ${item.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{item.amount >= 0 ? "+" : ""}{formatCurrency(item.amountUsd, currency)} <span className="text-brand-secondary">{item.asset}</span></td><td className="p-3"><span className="rounded-full bg-white/10 px-2 py-1 text-[10px]">{item.status}</span></td><td className="p-3 text-brand-secondary">{item.txHash || "—"}</td><td className="p-3 text-right text-brand-secondary">{new Date(item.createdAt).toLocaleString()}</td></tr>)}{!transactions.length && <tr><td colSpan={5} className="p-7 text-center text-brand-secondary">No ledger activity for this account yet.</td></tr>}</tbody></table></div></section>; }
function BalancesPanel({ account, currency, onRefresh }: { account?: TreasuryAccount; currency: string; onRefresh: () => void }) { return <section className="rounded-2xl border border-white/10 bg-brand-surface p-5"><div className="flex items-center justify-between"><div><h2 className="font-heading text-lg font-bold text-white">{account?.type === "DEMO" ? "Demo" : "Live"} account balance</h2><p className="mt-1 text-xs text-brand-secondary">This balance is isolated from your other account mode.</p></div><button type="button" onClick={onRefresh} className="rounded-lg p-2 text-brand-secondary hover:bg-white/10 hover:text-white" aria-label="Refresh balances"><RefreshCw className="h-4 w-4" /></button></div><div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">{account?.type ?? "Account"}</p><p className="mt-3 font-mono text-3xl font-bold text-white">{formatCurrency(account?.balance ?? 0, currency)}</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><Value label="Equity" value={formatCurrency(account?.equity ?? 0, currency)} /><Value label="Used margin" value={formatCurrency(account?.marginUsed ?? 0, currency)} /><Value label="Free margin" value={formatCurrency(account?.freeMargin ?? 0, currency)} /><Value label="Open P&L" value={`${(account?.unrealizedPnl ?? 0) >= 0 ? "+" : ""}${formatCurrency(account?.unrealizedPnl ?? 0, currency)}`} /></div></div></section>; }
function Value({ label, value }: { label: string; value: string }) { return <div><p className="text-brand-secondary">{label}</p><p className="mt-1 font-mono text-white">{value}</p></div>; }