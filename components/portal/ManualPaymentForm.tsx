"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Check, Copy, Landmark, QrCode, CreditCard, Gift, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";
import { useCurrency } from "@/context/CurrencyContext";

const methodOptions = [
  { id: "Bank wire", label: "Bank wire transfer", icon: Landmark },
  { id: "Crypto transfer", label: "Cryptocurrency", icon: QrCode },
  { id: "Debit / credit card", label: "Debit / credit card", icon: CreditCard },
  { id: "Gift card", label: "Gift / voucher card", icon: Gift },
] as const;

type MethodId = (typeof methodOptions)[number]["id"];

const cryptoOptions = [
  { key: "btcAddress", label: "Bitcoin", symbol: "BTC", network: "Bitcoin Mainnet" },
  { key: "ethAddress", label: "Ethereum", symbol: "ETH", network: "ERC-20 (Ethereum)" },
  { key: "usdtTrc20Address", label: "USDT (TRC-20)", symbol: "USDT", network: "TRC-20 (Tron)" },
  { key: "usdtErc20Address", label: "USDT (ERC-20)", symbol: "USDT", network: "ERC-20 (Ethereum)" },
  { key: "solAddress", label: "Solana", symbol: "SOL", network: "Solana Mainnet" },
] as const;

type CryptoKey = (typeof cryptoOptions)[number]["key"];

type PaymentDetails = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftBic?: string;
  routingNumber?: string;
  wireInstructions?: string;
  btcAddress?: string;
  ethAddress?: string;
  usdtTrc20Address?: string;
  usdtErc20Address?: string;
  solAddress?: string;
  media?: Record<string, { name: string; url: string }>;
};

export function ManualPaymentForm({
  kind,
  amount,
  planId,
  onSubmitted,
}: {
  kind: "DEPOSIT" | "PLAN";
  amount?: number;
  planId?: string;
  onSubmitted?: () => void;
}) {
  const { currency, formatMoney } = useCurrency();
  const [method, setMethod] = useState<MethodId>("Bank wire");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoKey>("usdtTrc20Address");
  const [value, setValue] = useState(amount?.toString() ?? "");
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [details, setDetails] = useState<PaymentDetails>({});
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/payments/deposit-details")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setDetails(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingDetails(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2200);
  };

  const activeCryptoItem = cryptoOptions.find((c) => c.key === selectedCrypto) ?? cryptoOptions[0];
  const activeCryptoAddress = details[activeCryptoItem.key] || "";
  const activeQrMedia = details.media?.[activeCryptoItem.key];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const data = new FormData();
      data.set("kind", kind);
      data.set("method", method === "Crypto transfer" ? `${method} (${activeCryptoItem.label})` : method);
      data.set("asset", method === "Crypto transfer" ? activeCryptoItem.symbol : "USD");
      data.set("amount", value);
      data.set("reference", reference.trim());
      if (proofFile) {
        data.set("proof", proofFile);
      }
      if (planId) {
        data.set("planId", planId);
      }

      const response = await fetch("/api/payment-requests", {
        method: "POST",
        body: data,
      });

      setBusy(false);

      if (response.ok) {
        setIsSuccess(true);
        setMessage(
          kind === "DEPOSIT"
            ? "Deposit payment request submitted! Your Live account balance will update as soon as treasury review is complete."
            : "Membership payment submitted! Your plan benefits will activate once treasury processing is complete."
        );
        setReference("");
        setProofFile(null);
        onSubmitted?.();
      } else {
        const errorData = await response.json().catch(() => null);
        setMessage(errorData?.error ?? "We couldn’t submit that payment. Please check your details and try again.");
      }
    } catch {
      setBusy(false);
      setMessage("A network error occurred while submitting. Please try again.");
    }
  }

  const numericValue = Number(value);

  const bankDataFields = [
    { label: "Bank Name", value: details.bankName, key: "bankName" },
    { label: "Beneficiary / Account Name", value: details.accountName, key: "accountName" },
    { label: "Account Number / IBAN", value: details.accountNumber, key: "accountNumber" },
    { label: "Routing Number", value: details.routingNumber, key: "routingNumber" },
    { label: "SWIFT / BIC Code", value: details.swiftBic, key: "swiftBic" },
  ];

  const hasAnyBankDetail = bankDataFields.some((f) => Boolean(f.value?.trim())) || Boolean(details.wireInstructions?.trim());

  return (
    <form onSubmit={submit} className="mt-5 space-y-6 rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6 backdrop-blur-sm">
      {/* 1. Payment Method Selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-secondary">
          Select funding method
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {methodOptions.map(({ id, label, icon: Icon }) => {
            const isSelected = method === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id);
                  setMessage("");
                }}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/15 text-brand-primary shadow-inner"
                    : "border-white/10 bg-white/[0.03] text-brand-secondary hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-brand-primary" : "text-brand-secondary"}`} />
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Admin Payment Details Display based on Selected Method */}
      {method === "Bank wire" && (
        <div className="space-y-4 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-brand-primary" />
              <div>
                <h3 className="text-sm font-bold text-white">Bank Wire Instructions</h3>
                <p className="text-xs text-brand-secondary">Direct wire transfer details configured by treasury</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
              Manual Verification
            </span>
          </div>

          {loadingDetails ? (
            <div className="py-6 text-center text-xs text-brand-secondary">Loading payment instructions…</div>
          ) : !hasAnyBankDetail ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Bank wire details pending configuration</p>
                <p className="mt-1 text-amber-200/80">
                  Treasury administration has not published bank details yet. You can still submit your payment request reference or choose Cryptocurrency.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {bankDataFields.map((field) => (
                <div
                  key={field.key}
                  className={`rounded-xl border border-white/10 bg-black/40 p-3 ${
                    field.key === "accountNumber" ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-brand-secondary">{field.label}</span>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(field.value!, field.key)}
                        className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary hover:bg-white/20 transition-colors"
                      >
                        {copiedKey === field.key ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-sm font-semibold text-white break-all">
                    {field.value || <span className="font-sans font-normal italic text-white/40">Not specified</span>}
                  </p>
                </div>
              ))}

              {details.wireInstructions ? (
                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-brand-primary">
                    Special Wire Instructions & Memo
                  </span>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-brand-text">
                    {details.wireInstructions}
                  </p>
                </div>
              ) : null}

              <div className="sm:col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-[11px] text-brand-secondary">
                💡 <strong className="text-white">Tip:</strong> When submitting your wire with your bank, include your full name or registered email in the wire transfer memo for expedited processing.
              </div>
            </div>
          )}
        </div>
      )}

      {method === "Crypto transfer" && (
        <div className="space-y-4 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-brand-primary" />
              <div>
                <h3 className="text-sm font-bold text-white">Crypto Deposit Instructions</h3>
                <p className="text-xs text-brand-secondary">Scan the QR code or transfer directly to the wallet address</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              Multi-Chain
            </span>
          </div>

          {/* Crypto Asset Pills */}
          <div className="flex flex-wrap gap-2">
            {cryptoOptions.map((item) => {
              const isSelected = selectedCrypto === item.key;
              const hasAddress = Boolean(details[item.key]);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedCrypto(item.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-brand-primary text-black shadow-md font-bold"
                      : "border border-white/10 bg-white/5 text-brand-secondary hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {hasAddress && !isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Crypto Details Box */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 sm:p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              {/* QR Image Box */}
              <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white p-2 shadow-inner">
                {activeQrMedia?.url ? (
                  <img
                    src={activeQrMedia.url}
                    alt={`${activeCryptoItem.label} QR Code`}
                    className="h-full w-full rounded object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center rounded border border-black/10 bg-neutral-100 p-2 text-center">
                    <QrCode className="h-12 w-12 text-black/60" />
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-black/70">
                      {activeCryptoItem.symbol}
                    </span>
                  </div>
                )}
              </div>

              {/* Network & Address Box */}
              <div className="w-full flex-1 space-y-2.5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-brand-secondary">
                    Network: <span className="text-white font-bold">{activeCryptoItem.network}</span>
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary uppercase">
                    {activeCryptoItem.symbol}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-brand-secondary">Deposit Address</span>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5">
                    <span className="font-mono text-xs text-white break-all pr-2">
                      {activeCryptoAddress || "Address pending administration configuration"}
                    </span>
                    {activeCryptoAddress && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeCryptoAddress, "cryptoAddress")}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-primary/20 px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-primary/30 transition-colors"
                      >
                        {copiedKey === "cryptoAddress" ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/80">
                  ⚠️ Send only {activeCryptoItem.label} ({activeCryptoItem.network}) to this address. Sending any other currency or using another network may result in irreversible loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === "Debit / credit card" && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <CreditCard className="h-5 w-5 text-brand-primary" />
            <h3 className="text-sm font-bold text-white">Card & Instant Escrow Gateway</h3>
          </div>
          <p className="text-xs leading-relaxed text-brand-secondary">
            Card transactions are handled through regulated institutional payment liaisons. Enter your requested deposit amount below and submit your payment request. A concierge payment link or terminal will be dispatched to your email / inbox.
          </p>
          <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/10 p-3 text-xs text-brand-primary">
            🔒 High-grade 256-bit SSL encryption. We never store CVV numbers or complete cardholder credentials.
          </div>
        </div>
      )}

      {method === "Gift card" && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <Gift className="h-5 w-5 text-brand-primary" />
            <h3 className="text-sm font-bold text-white">Voucher & Gift Card Redemption</h3>
          </div>
          <p className="text-xs leading-relaxed text-brand-secondary">
            We accept approved e-gift vouchers (Apple, Steam, Amazon, Vanilla Visa). Enter the equivalent USD value below, and provide the claim code or receipt reference in the payment reference field below.
          </p>
        </div>
      )}

      {/* 3. Deposit Amount & Reference Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-brand-secondary">
          Amount (USD) <span className="text-rose-400">*</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            readOnly={Boolean(amount)}
            required
            type="number"
            min="1"
            step="any"
            placeholder="e.g. 5000"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
          />
          {currency !== "USD" && Number.isFinite(numericValue) && numericValue > 0 ? (
            <span className="mt-1 block text-brand-secondary text-[11px]">
              ≈ {formatMoney(numericValue)}
            </span>
          ) : null}
        </label>

        <label className="block text-xs font-semibold text-brand-secondary">
          Payment Reference / Transaction ID (Optional)
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder={
              method === "Bank wire"
                ? "Wire confirmation number or sender name"
                : method === "Crypto transfer"
                ? "Blockchain Transaction Hash (TxID)"
                : "Transfer / claim reference"
            }
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
          />
        </label>
      </div>

      <CurrencyDisclosure />

      {/* 4. Receipt / Proof of Transfer Upload */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <label className="block text-xs font-semibold text-brand-secondary">
          <span className="flex items-center gap-1.5 text-white">
            <FileText className="h-4 w-4 text-brand-primary" />
            Upload payment receipt or transfer proof
          </span>
          <span className="mt-1 block text-[11px] text-brand-secondary">
            Supported formats: Images (PNG, JPG, WEBP) or PDF receipts from your banking or wallet app.
          </span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0] || null;
              setProofFile(file);
            }}
            className="mt-2.5 block w-full text-xs text-brand-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
          />
        </label>
        {proofFile && (
          <p className="mt-2 text-xs text-emerald-400">
            Selected file: <strong>{proofFile.name}</strong> ({(proofFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-brand-secondary">
        Security Note: All funding submissions are manually audited by compliance officers. Do not upload CVV numbers, online banking passwords, or private seed phrases.
      </p>

      {/* Message Banner */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border p-3.5 text-xs ${
            isSuccess
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={busy || !value || Number(value) <= 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-bold text-black transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          "Submitting payment request…"
        ) : (
          <>
            <span>Submit {kind === "DEPOSIT" ? "deposit payment" : "membership payment"}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}