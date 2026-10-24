import type { BrandConfig } from "@/config/brand.schema";
import type { MarketDataProvider, MarketPoint, MarketQuote } from "@/lib/market-data/types";
import { MockMarketDataProvider } from "@/lib/market-data/mock";

const coingeckoIds: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  LINK: "chainlink",
  MATIC: "matic-network",
  LTC: "litecoin",
  SHIB: "shiba-inu",
  UNI: "uniswap",
  ATOM: "cosmos",
  XLM: "stellar",
  APT: "aptos",
  NEAR: "near",
};

const DEMO_BASE_URL = "https://api.coingecko.com/api/v3";
const QUOTE_CACHE_TTL_MS = 15_000;
const QUOTE_REQUEST_TIMEOUT_MS = 4_000;

type QuoteCacheEntry = { data: MarketQuote[]; timestamp: number };

// Module-level state is shared by provider instances within a server process.
// The key retains the requested instrument set so a filtered request never
// receives quotes for a different page or market category.
const quoteCache = new Map<string, QuoteCacheEntry>();
const pendingQuoteRequests = new Map<string, Promise<MarketQuote[]>>();

function quoteCacheKey(instruments: BrandConfig["instruments"]) {
  return instruments.map((instrument) => instrument.symbol).join(",");
}

function demoHeaders() {
  const key = process.env.CG_API_KEY;
  const headers: Record<string, string> = {};
  if (key) headers["x-cg-demo-api-key"] = key;
  return headers;
}

export class CoinGeckoMarketDataProvider implements MarketDataProvider {
  private fallback = new MockMarketDataProvider();

  async getQuotes(instruments: BrandConfig["instruments"]): Promise<MarketQuote[]> {
    if (!instruments.length) return [];

    const cacheKey = quoteCacheKey(instruments);
    const cached = quoteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL_MS) return cached.data;

    const pending = pendingQuoteRequests.get(cacheKey);
    if (pending) return pending;

    const request = this.fetchQuotes(instruments, cacheKey);
    pendingQuoteRequests.set(cacheKey, request);

    try {
      return await request;
    } finally {
      pendingQuoteRequests.delete(cacheKey);
    }
  }

  private async fetchQuotes(instruments: BrandConfig["instruments"], cacheKey: string): Promise<MarketQuote[]> {
    const crypto = instruments.filter((instrument) => instrument.category === "crypto" && coingeckoIds[instrument.symbol]);
    const others = instruments.filter((instrument) => !crypto.includes(instrument));

    try {
      const ids = crypto.map((instrument) => coingeckoIds[instrument.symbol]).join(",");
      if (!ids) return this.cacheQuotes(cacheKey, await this.fallback.getQuotes(instruments));
      const response = await fetch(`${DEMO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`, {
        next: { revalidate: 30 },
        headers: demoHeaders(),
        signal: AbortSignal.timeout(QUOTE_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`CoinGecko request failed (${response.status})`);
      const data = (await response.json()) as Record<string, { usd: number; usd_24h_change: number; usd_24h_vol: number }>;
      const fallbackQuotes = await this.fallback.getQuotes(instruments);

      const quotes: MarketQuote[] = instruments.map((instrument) => {
        const id = coingeckoIds[instrument.symbol];
        const live = id ? data[id] : undefined;
        if (!live) return fallbackQuotes.find((quote) => quote.symbol === instrument.symbol)!;

        const sparkline = fallbackQuotes.find((quote) => quote.symbol === instrument.symbol)!.sparkline;
        return {
          symbol: instrument.symbol,
          name: instrument.name,
          category: instrument.category,
          price: Number.isFinite(live.usd) ? live.usd : 0,
          change24h: Number.isFinite(live.usd_24h_change) ? live.usd_24h_change : 0,
          high24h: Math.max(...sparkline, live.usd),
          low24h: Math.min(...sparkline, live.usd),
          volume: Number.isFinite(live.usd_24h_vol) ? live.usd_24h_vol : 0,
          sparkline,
          source: "live",
          updatedAt: new Date().toISOString(),
        };
      });
      return this.cacheQuotes(cacheKey, quotes);
    } catch {
      return this.cacheQuotes(cacheKey, await this.fallback.getQuotes([...crypto, ...others]));
    }
  }

  private cacheQuotes(cacheKey: string, data: MarketQuote[]) {
    quoteCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getHistory(symbol: string, timeframe: string): Promise<MarketPoint[]> {
    const id = coingeckoIds[symbol];
    if (!id) return this.fallback.getHistory(symbol, timeframe);

    const daysByTimeframe: Record<string, string> = {
      "1D": "1",
      "1W": "7",
      "1M": "30",
      "1Y": "365",
    };

    try {
      const days = daysByTimeframe[timeframe] ?? "1";
      const response = await fetch(`${DEMO_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
        next: { revalidate: timeframe === "1D" ? 60 : 300 },
        headers: demoHeaders(),
      });
      if (!response.ok) throw new Error("CoinGecko history request failed");
      const data = (await response.json()) as { prices?: [number, number][] };
      const prices = data.prices ?? [];
      if (!prices.length) throw new Error("CoinGecko history returned no prices");

      return prices.map(([time, price]) => ({
        time: new Date(time).toISOString(),
        price,
      }));
    } catch {
      return this.fallback.getHistory(symbol, timeframe);
    }
  }
}
