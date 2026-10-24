import { NextRequest, NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

const ROUTE_CACHE_TTL_MS = 15_000;
type CachedResponse = { body: { quotes: Awaited<ReturnType<ReturnType<typeof getMarketDataProvider>["getQuotes"]>>; total: number; offset: number; limit: number; updatedAt: string }; timestamp: number };
const responseCache = new Map<string, CachedResponse>();

export async function GET(request: NextRequest) {
  const cacheKey = request.nextUrl.search;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL_MS) {
    return NextResponse.json(cached.body, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45", "X-Cache": "HIT" } });
  }

  const brand = getBrandConfig();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.trim().toLowerCase();
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const filteredInstruments = brand.instruments.filter((instrument) =>
    (!category || category === "all" || instrument.category === category) &&
    (!query || `${instrument.symbol} ${instrument.name}`.toLowerCase().includes(query)),
  );
  const quotes = await getMarketDataProvider().getQuotes(filteredInstruments.slice(offset, offset + limit));

  const body = {
    quotes,
    total: filteredInstruments.length,
    offset,
    limit,
    updatedAt: new Date().toISOString(),
  };
  responseCache.set(cacheKey, { body, timestamp: Date.now() });

  return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45", "X-Cache": "MISS" } });
}
