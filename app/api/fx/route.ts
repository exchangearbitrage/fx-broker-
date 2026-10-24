import { NextResponse } from "next/server";
import { ExchangeRateApiProvider, FALLBACK_RATES, type FxRates } from "@/lib/fx/rates";

export const dynamic = "force-dynamic";
let lastGood: FxRates | null = null;
let nextFetchAt = 0;
let retryAfter = 0;
let fallbackReason: string | null = null;

const MIN_CACHE_MS = 60 * 60 * 1000;
const MAX_CACHE_MS = 24 * 60 * 60 * 1000;
const FAILURE_BACKOFF_MS = 20 * 60 * 1000;

function publicSnapshot(snapshot: FxRates, currency: string, source: FxRates["source"]) {
  const requested = snapshot.rates[currency] ? currency : "USD";
  return {
    currencies: Object.keys(snapshot.rates).sort(),
    currency: requested,
    rate: snapshot.rates[requested] ?? 1,
    updatedAt: snapshot.updatedAt,
    source,
    fallbackReason: source === "fallback" ? fallbackReason ?? "No live FX snapshot is available" : undefined,
  };
}

export async function GET(request: Request) {
  const now = Date.now();
  let refreshed = false;
  const requested = new URL(request.url).searchParams.get("currency")?.toUpperCase() || request.headers.get("x-display-currency")?.toUpperCase() || "USD";
  if ((!lastGood || now >= nextFetchAt) && now >= retryAfter) {
    try {
      const snapshot = await new ExchangeRateApiProvider().latestUsd();
      lastGood = snapshot;
      refreshed = true;
      fallbackReason = null;
      const providerExpiry = snapshot.nextUpdateAt ? new Date(snapshot.nextUpdateAt).getTime() - now : MAX_CACHE_MS;
      nextFetchAt = now + Math.max(MIN_CACHE_MS, Math.min(MAX_CACHE_MS, providerExpiry));
    } catch (error) {
      retryAfter = now + FAILURE_BACKOFF_MS;
      fallbackReason = error instanceof Error ? error.message : "Unknown FX provider error";
      console.warn("FX fallback enabled", { reason: fallbackReason, retryAfter: new Date(retryAfter).toISOString() });
    }
  }
  const snapshot = lastGood ?? FALLBACK_RATES;
  const source: FxRates["source"] = lastGood ? (refreshed ? "live" : "cached") : "fallback";
  const retryInSeconds = Math.max(0, Math.ceil((Math.max(nextFetchAt, retryAfter) - now) / 1000));
  return NextResponse.json(publicSnapshot(snapshot, requested, source), { headers: { "Cache-Control": `public, s-maxage=${Math.max(60, retryInSeconds)}, stale-while-revalidate=3600` } });
}
