import { FALLBACK_SNAPSHOT } from "@/lib/fx/fallback";

export type FxRates = {
  base: "USD";
  rates: Record<string, number>;
  updatedAt: string;
  source: "live" | "cached" | "fallback";
  nextUpdateAt?: string;
};

export interface FxProvider {
  latestUsd(): Promise<FxRates>;
}

type ProviderPayload = { result?: unknown; base_code?: unknown; rates?: unknown; conversion_rates?: unknown; time_last_update_unix?: unknown; time_next_update_unix?: unknown };

export function parseFxPayload(payload: ProviderPayload): FxRates {
  if (payload.result !== "success") throw new Error("result was error");
  if (payload.base_code !== "USD") throw new Error("base currency was not USD");
  const rawRates = payload.rates ?? payload.conversion_rates;
  if (!rawRates || typeof rawRates !== "object" || Array.isArray(rawRates)) throw new Error("rates missing");
  const rates = Object.fromEntries(Object.entries(rawRates).filter(([code, rate]) => /^[A-Z]{3}$/.test(code) && typeof rate === "number" && Number.isFinite(rate) && rate > 0));
  if (rates.USD !== 1) throw new Error("USD rate missing");
  const updatedSeconds = typeof payload.time_last_update_unix === "number" ? payload.time_last_update_unix : Math.floor(Date.now() / 1000);
  const nextSeconds = typeof payload.time_next_update_unix === "number" ? payload.time_next_update_unix : undefined;
  return { base: "USD", rates, updatedAt: new Date(updatedSeconds * 1000).toISOString(), nextUpdateAt: nextSeconds ? new Date(nextSeconds * 1000).toISOString() : undefined, source: "live" };
}

let displayRates: Record<string, number> = { USD: 1 };
export function setDisplayRates(rates: Record<string, number>) { displayRates = rates; }

// This deliberately small, bundled snapshot keeps the display layer usable when
// the provider is unavailable. It is indicative only and is never persisted.
export const FALLBACK_RATES: FxRates = {
  base: "USD",
  rates: { USD: 1, AED: 3.6725, AUD: 1.433021, BRL: 5.035924, CAD: 1.422795, CHF: 0.833623, CNY: 6.706494, EGP: 53.095404, EUR: 0.894425, GBP: 0.756165, INR: 95.252751, JPY: 158.305497, KRW: 1339.811585, NGN: 1331.826337, ZAR: 16.579734 },
  updatedAt: "2026-10-15T00:02:31.000Z",
  source: "fallback",
};

export class ExchangeRateApiProvider implements FxProvider {
  async latestUsd(): Promise<FxRates> {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(3000), next: { revalidate: 21600 } });
    if (!response.ok) throw new Error(`FX provider returned HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) throw new Error(`non-JSON content-type: ${contentType || "missing"}`);
    const data = await response.json() as ProviderPayload;
    return parseFxPayload(data);
  }
}

export function formatMoney(amountUsd: number | null | undefined, options: { currency?: string; locale?: string; rates?: Record<string, number>; maximumFractionDigits?: number } = {}) {
  const currency = options.currency ?? "USD";
  const amount = (Number.isFinite(amountUsd) ? Number(amountUsd) : 0) * (options.rates?.[currency] ?? displayRates[currency] ?? 1);
  try {
    return new Intl.NumberFormat(options.locale ?? "en-US", { style: "currency", currency, maximumFractionDigits: options.maximumFractionDigits ?? (Math.abs(amount) >= 1000 ? 0 : undefined) }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(options.locale ?? "en-US", { maximumFractionDigits: options.maximumFractionDigits ?? 2 })}`;
  }
}

