"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FALLBACK_RATES, formatMoney, setDisplayRates } from "@/lib/fx/rates";
type FxResponse = { currencies?: string[]; currency?: string; rate?: number; updatedAt?: string };
type FormatOptions = { currency?: string };
type Value = { currency: string; rates: Record<string, number>; supportedCurrencies: string[]; updatedAt: string | null; notice: string | null; setCurrency: (currency: string) => void; formatMoney: (value: number | null | undefined, options?: FormatOptions) => string };
const CurrencyContext = createContext<Value>({ currency: "USD", rates: { USD: 1 }, supportedCurrencies: Object.keys(FALLBACK_RATES.rates), updatedAt: null, notice: null, setCurrency: () => undefined, formatMoney: (value, options) => formatMoney(value, options) });
const MAX_AGE_MS = 72 * 60 * 60 * 1000;
function initialCurrency() { if (typeof window === "undefined") return "USD"; return window.localStorage.getItem("displayCurrency") || window.localStorage.getItem("currency") || "USD"; }
function isFresh(updatedAt: string) { const time = Date.parse(updatedAt); return Number.isFinite(time) && Date.now() - time <= MAX_AGE_MS; }
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth(); const [currency, setCurrencyState] = useState("USD"); const [rates, setRates] = useState<Record<string, number>>({ USD: 1 }); const ratesRef = useRef(rates); const [supportedCurrencies, setSupportedCurrencies] = useState(Object.keys(FALLBACK_RATES.rates)); const [updatedAt, setUpdatedAt] = useState<string | null>(null); const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { ratesRef.current = rates; }, [rates]);
  const loadRate = useCallback(async (requested: string) => { try { const response = await fetch(`/api/fx?currency=${encodeURIComponent(requested)}`); if (!response.ok) throw new Error(); const data = await response.json() as FxResponse; if (!data.currency || !Number.isFinite(data.rate) || !data.updatedAt) throw new Error(); setRates((current) => ({ ...current, USD: 1, [data.currency!]: data.rate! })); setSupportedCurrencies(data.currencies?.length ? data.currencies : Object.keys(FALLBACK_RATES.rates)); setUpdatedAt(data.updatedAt); setNotice(data.currency !== requested ? `${requested} is unavailable right now, so amounts are shown in USD.` : !isFresh(data.updatedAt) ? "Exchange rates may be out of date." : null); return data.currency; } catch { if (requested === "USD" || ratesRef.current[requested]) return requested; setNotice("Exchange rates may be out of date."); return "USD"; } }, []);
  useEffect(() => { const initial = initialCurrency(); setCurrencyState(initial); void loadRate(initial).then(setCurrencyState); }, [loadRate]);
  useEffect(() => { setDisplayRates(rates); }, [rates]);
  useEffect(() => { if (isAuthenticated && user?.displayCurrency) { setCurrencyState(user.displayCurrency); void loadRate(user.displayCurrency); } }, [isAuthenticated, loadRate, user?.displayCurrency]);
  const setCurrency = useCallback((next: string) => { void loadRate(next).then((safe) => { setCurrencyState(safe); window.localStorage.setItem("displayCurrency", safe); window.localStorage.setItem("currency", safe); document.cookie = `displayCurrency=${safe};path=/;max-age=31536000;SameSite=Lax`; if (isAuthenticated) void fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayCurrency: safe, displayCurrencyManuallySet: true }) }); }); }, [isAuthenticated, loadRate]);
  const value = useMemo(() => ({ currency, rates, supportedCurrencies, updatedAt, notice, setCurrency, formatMoney: (amount: number | null | undefined, options: FormatOptions = {}) => formatMoney(amount, { currency: options.currency ?? currency, rates, locale: typeof navigator === "undefined" ? "en-US" : navigator.language }) }), [currency, rates, supportedCurrencies, updatedAt, notice, setCurrency]); return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
export function useCurrency() { return useContext(CurrencyContext); }
