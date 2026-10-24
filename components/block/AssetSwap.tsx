"use client";

import { ArrowDown, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useTranslation } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

export type Asset = {
  symbol: string;
  name: string;
  price: number;
  color: string;
};

export const ASSETS: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67200, color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", price: 3440, color: "#8ea2ff" },
  { symbol: "SOL", name: "Solana", price: 148, color: "#76f7d2" },
  { symbol: "USD", name: "US Dollar", price: 1, color: "#d8e6df" },
  { symbol: "EUR", name: "Euro", price: 1.08, color: "#9db7ff" },
];

const bySymbol = Object.fromEntries(ASSETS.map((asset) => [asset.symbol, asset])) as Record<string, Asset>;

export function AssetSwap({ onAssetChange, prices = {} }: { onAssetChange?: (symbol: string) => void; prices?: Record<string, number> }) {
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();
  const [symbols, setSymbols] = useState<[string, string]>(["BTC", "USD"]);
  const [turns, setTurns] = useState(0);
  const [picker, setPicker] = useState<number | null>(null);
  const [editing, setEditing] = useState<0 | 1>(0);
  const [amount, setAmount] = useState("0.08");
  const [notice, setNotice] = useState("");
  const priceFor = (symbol: string) => prices[symbol] ?? bySymbol[symbol].price;
  const rate = priceFor(symbols[0]) / priceFor(symbols[1]);
  const parsed = amount === "" || amount === "." ? Number.NaN : Number(amount);
  const value = editing === 0 ? parsed * priceFor(symbols[0]) : (parsed * priceFor(symbols[1]) / rate) * priceFor(symbols[0]);

  const amounts = useMemo(() => {
    if (!Number.isFinite(parsed) || parsed < 0) return ["", ""] as [string, string];
    const receive = parsed * rate * 0.997;
    const pay = parsed / (rate * 0.997);
    return editing === 0 ? [amount, formatValue(receive, symbols[1])] : [formatValue(pay, symbols[0]), amount];
  }, [amount, editing, parsed, rate, symbols]);

  function updateAmount(value: string, index: 0 | 1) {
    const decimals = ["USD", "EUR"].includes(symbols[index]) ? 2 : 8;
    const clean = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    const [whole, fraction = ""] = clean.split(".");
    const next = clean.includes(".") ? `${whole}.${fraction.slice(0, decimals)}` : whole;
    if (next && Number(next) > 100000000) { setNotice("Enter an amount below 100,000,000."); return; }
    setNotice(""); setEditing(index); setAmount(next);
  }

  function choose(symbol: string) {
    if (picker === null) return;
    setSymbols((current) => {
      const next: [string, string] = [current[0], current[1]];
      const other = 1 - picker;
      if (next[other] === symbol) next[other] = next[picker];
      next[picker] = symbol;
      return next;
    });
    onAssetChange?.(symbol);
    setAmount(picker === 0 ? "0.08" : "5000"); setEditing(picker as 0 | 1);
    setPicker(null);
  }

  return (
    <div className="swp">
      {symbols.map((symbol, index) => {
        const asset = bySymbol[symbol];
        const open = picker === index;
        const role = index === 0 ? (t.youPay ?? "You pay") : (t.youReceive ?? "You receive");
        return (
          <motion.div
            key={index}
            className="swp-card"
            data-lifted={open || undefined}
            initial={false}
            animate={{ top: open ? 0 : index * 119, height: open ? 235 : 116, opacity: picker !== null && !open ? 0 : 1 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.14 }}
          >
            <motion.div className="swp-face" animate={{ opacity: open ? 0 : 1 }}>
              <span className="swp-label">{role}</span>
              <label className="sr-only" htmlFor={`swap-amount-${index}`}>{role} amount</label>
              <input id={`swap-amount-${index}`} aria-label={`${role} amount in ${asset.symbol}`} inputMode="decimal" value={amounts[index]} onChange={(event) => updateAmount(event.target.value, index as 0 | 1)} onPaste={(event) => { event.preventDefault(); updateAmount(event.clipboardData.getData("text"), index as 0 | 1); }} className="swp-amount" />
              <span className="swp-fiat">{formatMoney(value)}</span>
              <button type="button" className="swp-coin" onClick={() => setPicker(index)}>
                <span className="swp-token" style={{ background: asset.color }}>{asset.symbol.slice(0, 1)}</span>
                {asset.symbol}
              </button>
            </motion.div>
            <AnimatePresence>
              {open ? (
                <motion.div className="swp-pick-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="swp-pick-head">
                    <span>{role}</span>
                    <button type="button" className="swp-pick-x" onClick={() => setPicker(null)} aria-label="Close asset picker">
                      <X size={16} />
                    </button>
                  </div>
                  {ASSETS.map((option) => (
                    <button key={option.symbol} type="button" className="swp-pick-row" onClick={() => choose(option.symbol)}>
                      <span className="swp-token" style={{ background: option.color }}>{option.symbol.slice(0, 1)}</span>
                      <span className="swp-pick-sym">{option.symbol}</span>
                      <span className="swp-pick-name">{option.name}</span>
                      {symbol === option.symbol ? <Check className="swp-pick-on" size={16} /> : null}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <motion.button
        type="button"
        className="swp-flip"
        animate={{ rotate: turns * 180, opacity: picker === null ? 1 : 0, scale: picker === null ? 1 : 0.6 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.28 }}
        onClick={() => { setTurns((count) => count + 1); setEditing((index) => index === 0 ? 1 : 0); }}
        aria-label="Reverse conversion direction"
      >
        <ArrowDown size={18} />
      </motion.button>
      {notice ? <p className="swp-notice" aria-live="polite">{notice}</p> : null}
    </div>
  );
}

function formatValue(value: number, symbol: string) { if (!Number.isFinite(value)) return ""; const digits = ["USD", "EUR"].includes(symbol) ? 2 : 8; return value.toLocaleString("en-US", { maximumFractionDigits: digits, useGrouping: false }); }
