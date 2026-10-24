"use client";

import { useEffect, useState } from "react";
import { useDismissibleModal } from "@/components/ui/useDismissibleModal";
import { X, Copy, Check, QrCode, ArrowDownLeft, ArrowUpRight, ShieldCheck, Zap, AlertTriangle, Sparkles, Landmark, CreditCard, FileText } from "lucide-react";
import type { StrategyProvider, StakingVault, Position } from "./types";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";

function ConvertedAmountPreview({ value }: { value: string }) {
  const { currency, formatMoney } = useCurrency();
  const amount = Number(value);
  if (currency === "USD" || value.trim() === "" || !Number.isFinite(amount)) return null;
  return <p className="mt-1 text-xs text-brand-secondary" aria-live="polite">≈ {formatMoney(amount)}</p>;
}

// ── 1. DEPOSIT MODAL ────────────────────────────────────────────────────────
interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, asset: string) => void;
}

const cryptoAssets = [
  { key: "usdtTrc20Address", label: "USDT (TRC-20)", symbol: "USDT", network: "Tron TRC-20" },
  { key: "btcAddress", label: "Bitcoin", symbol: "BTC", network: "Bitcoin Mainnet" },
  { key: "ethAddress", label: "Ethereum", symbol: "ETH", network: "ERC-20 (Ethereum)" },
  { key: "usdtErc20Address", label: "USDT (ERC-20)", symbol: "USDT", network: "ERC-20 (Ethereum)" },
  { key: "solAddress", label: "Solana", symbol: "SOL", network: "Solana Mainnet" },
] as const;

type CryptoAssetKey = (typeof cryptoAssets)[number]["key"];

export function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  useDismissibleModal(isOpen, onClose);
  const { currency, formatMoney } = useCurrency();
  const [method, setMethod] = useState<"WIRE" | "CRYPTO" | "CARD">("WIRE");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAssetKey>("usdtTrc20Address");
  const [amount, setAmount] = useState("5000");
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<
    Record<string, string> & { media?: Record<string, { url: string; name: string }> }
  >({});

  useEffect(() => {
    if (isOpen) {
      fetch("/api/payments/deposit-details")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => data && setPaymentDetails(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const activeCrypto = cryptoAssets.find((c) => c.key === selectedCrypto) ?? cryptoAssets[0];
  const activeAddress = paymentDetails[activeCrypto.key] || "";
  const qrImage = paymentDetails.media?.[activeCrypto.key];

  const handleConfirm = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const form = new FormData();
    form.set("kind", "DEPOSIT");
    const methodLabel = method === "WIRE" ? "Bank Wire" : method === "CRYPTO" ? `Crypto (${activeCrypto.label})` : "Card / Apple Pay";
    const assetLabel = method === "CRYPTO" ? activeCrypto.symbol : "USD";
    form.set("method", methodLabel);
    form.set("asset", assetLabel);
    form.set("amount", String(num));
    if (reference.trim()) form.set("reference", reference.trim());
    if (proofFile) form.set("proof", proofFile);

    const response = await fetch("/api/payment-requests", { method: "POST", body: form });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data?.error ?? "We couldn’t submit your deposit for approval.");
      return;
    }

    onDepositSuccess(num, assetLabel);
    onClose();
  };

  const bankFields = [
    { label: "Bank Name", value: paymentDetails.bankName, key: "bankName" },
    { label: "Beneficiary / Account Name", value: paymentDetails.accountName, key: "accountName" },
    { label: "Account Number / IBAN", value: paymentDetails.accountNumber, key: "accountNumber" },
    { label: "Routing Number", value: paymentDetails.routingNumber, key: "routingNumber" },
    { label: "SWIFT / BIC Code", value: paymentDetails.swiftBic, key: "swiftBic" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Deposit Funds</h3>
            <p className="text-xs text-brand-secondary">Submit funds according to official treasury instructions</p>
          </div>
        </div>

        {/* Method selector tabs */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { id: "WIRE" as const, label: "Bank Wire", icon: Landmark },
            { id: "CRYPTO" as const, label: "Crypto Transfer", icon: QrCode },
            { id: "CARD" as const, label: "Card / Apple Pay", icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMethod(id);
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                method === id
                  ? "border-brand-primary bg-brand-primary/15 text-brand-primary shadow-inner"
                  : "border-white/10 bg-white/5 text-brand-secondary hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic method content */}
        {method === "WIRE" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-brand-primary/20 bg-black/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Official Wire Instructions
                </span>
                <span className="text-[10px] text-brand-secondary">Treasury Verified</span>
              </div>

              <div className="space-y-2 text-xs">
                {bankFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] p-2">
                    <span className="text-brand-secondary">{field.label}:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-white break-all text-right">
                        {field.value || "Not configured"}
                      </span>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => handleCopy(field.value!, field.key)}
                          className="flex items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-brand-primary hover:bg-white/20"
                        >
                          {copiedKey === field.key ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                          <span>{copiedKey === field.key ? "Copied" : "Copy"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {paymentDetails.wireInstructions && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-[11px]">
                    <span className="font-semibold text-brand-primary block mb-0.5">Wire Memo / Notes:</span>
                    <span className="text-brand-text whitespace-pre-wrap">{paymentDetails.wireInstructions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {method === "CRYPTO" && (
          <div className="mt-5 space-y-4">
            {/* Crypto Asset Pills */}
            <div className="flex flex-wrap gap-1.5">
              {cryptoAssets.map((asset) => {
                const isSelected = selectedCrypto === asset.key;
                return (
                  <button
                    key={asset.key}
                    type="button"
                    onClick={() => setSelectedCrypto(asset.key)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-brand-primary text-black font-bold"
                        : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                    }`}
                  >
                    {asset.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2">
                {qrImage ? (
                  <img src={qrImage.url} alt={`${activeCrypto.label} deposit QR`} className="h-full w-full rounded object-contain" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center rounded border border-black/15 bg-neutral-100 text-black">
                    <QrCode className="h-10 w-10 text-black/60" />
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">{activeCrypto.symbol} QR</span>
                  </div>
                )}
              </div>
              <p className="mt-2.5 text-xs text-brand-secondary">
                Network: <span className="font-semibold text-white">{activeCrypto.network}</span>
              </p>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-mono">
                <span className="truncate text-white/90">{activeAddress || "Deposit address not configured yet"}</span>
                {activeAddress && (
                  <button
                    type="button"
                    onClick={() => handleCopy(activeAddress, "cryptoAddress")}
                    className="ml-2 flex shrink-0 items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] text-brand-primary hover:bg-white/20"
                  >
                    {copiedKey === "cryptoAddress" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === "cryptoAddress" ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {method === "CARD" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-brand-secondary space-y-2">
              <div className="flex justify-between">
                <span>Payment Gateway:</span>
                <span className="text-white font-semibold">Tier-1 Institutional Escrow</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Time:</span>
                <span className="text-emerald-400 font-semibold">Instant (0-1 min)</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Fee:</span>
                <span className="text-white font-semibold">0.00% (Covered by Broker)</span>
              </div>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Deposit Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
            <ConvertedAmountPreview value={amount} />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-secondary">
              Payment Reference / TxHash (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={method === "WIRE" ? "Wire confirmation # or sender name" : method === "CRYPTO" ? "Blockchain TxID" : "Payment reference"}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-secondary flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-brand-primary" />
              Upload Transfer Receipt or Proof
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs text-brand-secondary file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
            />
            {proofFile && (
              <p className="mt-1 text-[11px] text-emerald-400">
                Attached: <strong>{proofFile.name}</strong>
              </p>
            )}
          </div>
        </div>

        <CurrencyDisclosure />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !amount || Number(amount) <= 0}
            onClick={handleConfirm}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : `Submit for approval (${formatMoney(Number(amount))})`}
          </button>
        </div>

        {error && (
          <div role="status" aria-live="polite" className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. WITHDRAW MODAL ───────────────────────────────────────────────────────
interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: (amount: number, asset: string) => void;
}

export function WithdrawModal({ isOpen, onClose, availableBalance, onWithdrawSuccess }: WithdrawModalProps) {
  useDismissibleModal(isOpen, onClose);
  const { currency, formatMoney } = useCurrency();
  const [method, setMethod] = useState<"WIRE" | "CRYPTO">("WIRE");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAssetKey>("usdtTrc20Address");
  const [amount, setAmount] = useState("2500");

  // Bank wire destination fields
  const [bankName, setBankName] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  // Crypto destination fields
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const activeCrypto = cryptoAssets.find((c) => c.key === selectedCrypto) ?? cryptoAssets[0];

  const handleConfirm = async () => {
    setError("");
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    if (num > availableBalance) {
      setError(`Amount exceeds your available free margin of ${formatCurrency(availableBalance, "USD")}.`);
      return;
    }

    let destinationSummary = "";
    let assetLabel = "USD";

    if (method === "WIRE") {
      if (!beneficiaryName.trim() || !iban.trim() || !swift.trim() || !bankName.trim()) {
        setError("Please complete all required bank wire details (Bank, Beneficiary, IBAN/Account, SWIFT).");
        return;
      }
      destinationSummary = `Bank Wire: ${bankName.trim()} | Beneficiary: ${beneficiaryName.trim()} | IBAN: ${iban.trim()} | SWIFT: ${swift.trim()}${routingNumber.trim() ? ` | Routing: ${routingNumber.trim()}` : ""}`;
      assetLabel = "USD";
    } else {
      if (!cryptoAddress.trim()) {
        setError(`Please enter your receiving ${activeCrypto.label} wallet address.`);
        return;
      }
      destinationSummary = `${activeCrypto.label} (${activeCrypto.network}): ${cryptoAddress.trim()}`;
      assetLabel = activeCrypto.symbol;
    }

    setIsSubmitting(true);

    try {
      await fetch("/api/wallet/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WITHDRAWAL",
          asset: assetLabel,
          amount: num,
          txHash: destinationSummary,
        }),
      }).catch(() => {});

      onWithdrawSuccess(num, assetLabel);
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
      setError("Unable to record withdrawal request. Please check your connection and try again.");
    }
  };

  const gasFee = method === "CRYPTO" ? (activeCrypto.symbol === "BTC" ? 5 : activeCrypto.symbol === "ETH" ? 4 : 1) : 0;
  const netPayout = Math.max(0, (parseFloat(amount) || 0) - gasFee);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Withdraw Capital</h3>
            <p className="text-xs text-brand-secondary">
              Available Free Margin: <span className="text-emerald-400 font-mono font-bold">{formatMoney(availableBalance)}</span>
            </p>
          </div>
        </div>

        {/* Method selector tabs */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            { id: "WIRE" as const, label: "Bank Wire", icon: Landmark },
            { id: "CRYPTO" as const, label: "Crypto Transfer", icon: QrCode },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMethod(id);
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                method === id
                  ? "border-amber-400 bg-amber-400/15 text-amber-300 shadow-inner"
                  : "border-white/10 bg-white/5 text-brand-secondary hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic method destination inputs */}
        {method === "WIRE" && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Destination Bank Details
              </span>
              <span className="text-[10px] text-brand-secondary">SEPA / SWIFT / Wire</span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
              <div>
                <label className="text-brand-secondary">Beneficiary Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-brand-secondary">Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Barclays, JPMorgan Chase"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-brand-secondary">Account Number / IBAN *</label>
                <input
                  type="text"
                  placeholder="e.g. GB29BARC20041538153401"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-brand-secondary">SWIFT / BIC Code *</label>
                <input
                  type="text"
                  placeholder="e.g. BARCGB22"
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-brand-secondary">Routing / Sort Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 021000021"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {method === "CRYPTO" && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white block">
              Choose Payout Asset
            </span>

            {/* Asset pills */}
            <div className="flex flex-wrap gap-1.5">
              {cryptoAssets.map((asset) => {
                const isSelected = selectedCrypto === asset.key;
                return (
                  <button
                    key={asset.key}
                    type="button"
                    onClick={() => setSelectedCrypto(asset.key)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-amber-400 text-black font-bold"
                        : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                    }`}
                  >
                    {asset.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between text-[11px] text-brand-secondary">
                <span>Receiving Wallet Network:</span>
                <span className="font-semibold text-white">{activeCrypto.network}</span>
              </div>
              <label className="block text-brand-secondary">
                Your {activeCrypto.label} Receiving Address *
              </label>
              <input
                type="text"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                placeholder={
                  activeCrypto.key === "usdtTrc20Address"
                    ? "Enter Tron TRC-20 wallet address (starts with T...)"
                    : activeCrypto.key === "btcAddress"
                    ? "Enter Bitcoin address (e.g. bc1... or 1...)"
                    : activeCrypto.key === "solAddress"
                    ? "Enter Solana wallet address"
                    : "Enter ERC-20 address (starts with 0x...)"
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-amber-300/80">
                ⚠️ Ensure your receiving wallet supports the {activeCrypto.network}. Withdrawals to unsupported addresses cannot be undone.
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Amount */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <label className="font-semibold text-brand-secondary">Withdrawal Amount (USD)</label>
            <button
              type="button"
              onClick={() => setAmount(availableBalance.toFixed(2))}
              className="text-amber-400 hover:underline font-semibold"
            >
              Max All ({formatMoney(availableBalance)})
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-amber-400 focus:outline-none"
          />
          <ConvertedAmountPreview value={amount} />
        </div>

        <CurrencyDisclosure />

        {/* Fees & Execution Breakdown */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1.5">
          <div className="flex justify-between">
            <span>Estimated Processing:</span>
            <span className="text-white font-semibold">
              {method === "CRYPTO" ? "Instant (5-15 mins)" : "Same-day SEPA / SWIFT (1-2 days)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Processing / Network Fee:</span>
            <span className="text-white font-semibold font-mono">
              {gasFee > 0 ? `${formatMoney(gasFee)} ${activeCrypto.symbol}` : "0.00% (Covered by Broker)"}
            </span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-1.5">
            <span className="text-white font-medium">Net Estimated Payout:</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">
              {formatMoney(netPayout)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !amount || Number(amount) <= 0}
            onClick={handleConfirm}
            className="w-1/2 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : `Submit Withdrawal (${formatMoney(Number(amount) || 0)})`}
          </button>
        </div>

        {error && (
          <div role="status" aria-live="polite" className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. NEW ORDER / POSITION MODAL ──────────────────────────────────────────
interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (order: Omit<Position, "id" | "pnl" | "pnlPercent" | "openedAt">) => void;
  availableMargin: number;
}

const AVAILABLE_INSTRUMENTS = [
  { symbol: "BTC", name: "Bitcoin / USD", price: 64120.5, category: "crypto" },
  { symbol: "ETH", name: "Ethereum / USD", price: 2514.2, category: "crypto" },
  { symbol: "SOL", name: "Solana / USD", price: 148.8, category: "crypto" },
  { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0892, category: "forex" },
  { symbol: "GBPUSD", name: "British Pound / USD", price: 1.3065, category: "forex" },
  { symbol: "XAUUSD", name: "Gold / US Dollar", price: 2672.4, category: "commodities" },
  { symbol: "AAPL", name: "Apple Inc", price: 234.2, category: "shares" },
  { symbol: "TSLA", name: "Tesla Inc", price: 224.9, category: "shares" },
  { symbol: "SPX", name: "S&P 500 Index", price: 5815.0, category: "indices" },
];

export function NewOrderModal({ isOpen, onClose, onPlaceOrder, availableMargin }: NewOrderModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState(50);
  const [size, setSize] = useState("0.5");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentInst = AVAILABLE_INSTRUMENTS.find((i) => i.symbol === symbol) ?? AVAILABLE_INSTRUMENTS[0];
  const notional = (parseFloat(size) || 0) * currentInst.price;
  const requiredMargin = leverage > 0 ? notional / leverage : notional;

  const handleSubmit = () => {
    setError("");
    const numSize = parseFloat(size);
    if (isNaN(numSize) || numSize <= 0) {
      setError("Please specify a valid order size.");
      return;
    }
    if (requiredMargin > availableMargin) {
      setError(`Required margin of ${formatCurrency(requiredMargin, "USD")} exceeds free margin.`);
      return;
    }

    onPlaceOrder({
      symbol: currentInst.symbol,
      name: currentInst.name,
      category: currentInst.category as any,
      type: side,
      leverage,
      entryPrice: currentInst.price,
      markPrice: currentInst.price,
      size: numSize,
      margin: requiredMargin,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    });
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Execute Order</h3>
            <p className="text-xs text-brand-secondary">Direct market routing with up to 100x leverage</p>
          </div>
        </div>

        {/* Long / Short Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "BUY"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "border border-white/10 bg-white/5 text-brand-secondary"
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "SELL"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "border border-white/10 bg-white/5 text-brand-secondary"
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Instrument select */}
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Select Instrument</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm font-semibold text-white focus:border-brand-primary focus:outline-none"
            >
              {AVAILABLE_INSTRUMENTS.map((inst) => (
                <option key={inst.symbol} value={inst.symbol} className="bg-[#181d18] text-white">
                  {inst.symbol} — {inst.name} (${inst.price})
                </option>
              ))}
            </select>
          </div>

          {/* Leverage Slider */}
          <div>
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-brand-secondary">Leverage Multiplier</label>
              <span className="font-mono font-bold text-brand-primary">{leverage}x</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {[1, 5, 10, 25, 50, 100].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                    leverage === lev
                      ? "bg-brand-primary text-black"
                      : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Order Size ({symbol})</label>
            <input
              type="number"
              step="any"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* TP & SL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-400">Take Profit Price</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-400">Stop Loss Price</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Margin requirement preview */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Total Position Notional:</span>
              <span className="text-white font-semibold">{formatCurrency(notional, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span>Required Margin ({leverage}x):</span>
              <span className="text-brand-primary font-bold">{formatCurrency(requiredMargin, "USD")}</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-1/2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "BUY" ? "bg-emerald-400 text-black" : "bg-rose-500 text-white"
            } hover:brightness-105 active:scale-98`}
          >
            Confirm {side} Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. COPY TRADER MODAL ───────────────────────────────────────────────────
interface CopyTraderModalProps {
  provider: StrategyProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCopy: (providerId: string, amount: number, maxDrawdown?: number) => void | Promise<void>;
}

export function CopyTraderModal({ provider, isOpen, onClose, onConfirmCopy }: CopyTraderModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [allocation, setAllocation] = useState("5000");
  const [maxDrawdown, setMaxDrawdown] = useState("15");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !provider) return null;

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary font-bold text-lg border border-brand-primary/20">
            {provider.avatar}
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Copy {provider.name}</h3>
            <p className="text-xs text-brand-secondary">
              30d ROI: <span className="text-emerald-400 font-bold font-mono">+{provider.roi30d}%</span> • Win Rate: <span className="text-white font-mono">{provider.winRate}%</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Allocation Capital ($ USD)</label>
            <input
              type="number"
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-secondary">Auto Stop-Loss Threshold (%)</label>
            <input
              type="number"
              value={maxDrawdown}
              onChange={(e) => setMaxDrawdown(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-brand-secondary">
              If copier equity drops by {maxDrawdown}%, all mirroring positions will instantly close to protect capital.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1">
            <div className="flex justify-between">
              <span>Management Fee:</span>
              <span className="text-emerald-400 font-semibold">0% (Completely Free)</span>
            </div>
            <div className="flex justify-between">
              <span>Execution Mode:</span>
              <span className="text-white font-semibold">Proportional Balance STP</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try { await onConfirmCopy(provider.id, parseFloat(allocation) || 1000, parseFloat(maxDrawdown) || 15); onClose(); } finally { setIsSubmitting(false); }
            }}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98"
          >
            {isSubmitting ? "Executing Mirror..." : "Start Mirror Trading"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 5. STAKE MODAL ─────────────────────────────────────────────────────────
interface StakeModalProps {
  vault: StakingVault | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStake: (vaultId: string, amount: number) => Promise<boolean | void> | boolean | void;
  error?: string;
}

export function StakeModal({ vault, isOpen, onClose, onConfirmStake, error = "" }: StakeModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !vault) return null;

  const numAmount = parseFloat(amount) || 0;
  const yearlyReward = (numAmount * vault.apy) / 100;
  const dailyReward = yearlyReward / 365;

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl font-extrabold text-black text-lg"
            style={{ backgroundColor: vault.iconBg }}
          >
            {vault.symbol.slice(0, 1)}
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Stake {vault.name}</h3>
            <p className="text-xs text-brand-secondary">
              Yield: <span className="text-brand-primary font-bold font-mono">{vault.apy}% APY</span> • {vault.period} lock
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Stake Amount ({vault.symbol})</label>
            <input
              type="number"
              step="any"
              placeholder={`Min ${vault.minAmount} ${vault.symbol}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Estimated Daily Reward:</span>
              <span className="text-emerald-400 font-bold">{dailyReward.toFixed(5)} {vault.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Annual Yield:</span>
              <span className="text-white font-bold">{yearlyReward.toFixed(4)} {vault.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Payout Schedule:</span>
              <span className="text-brand-secondary font-sans">Every 24 hours at 00:00 UTC</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={numAmount <= 0 || submitting}
            onClick={() => { void (async () => { setSubmitting(true); const result = await onConfirmStake(vault.id, numAmount); setSubmitting(false); if (result !== false) onClose(); })(); }}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {submitting ? "Confirming…" : "Confirm Staking"}
          </button>
        </div>
        {error ? <p role="status" aria-live="polite" className="mt-3 text-xs leading-5 text-rose-200">{error}</p> : null}
      </div>
    </div>
  );
}
