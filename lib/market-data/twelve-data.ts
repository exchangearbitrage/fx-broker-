import type { BrandConfig } from "@/config/brand.schema";
import type { MarketDataProvider, MarketPoint, MarketQuote } from "@/lib/market-data/types";
import { MockMarketDataProvider } from "@/lib/market-data/mock";

const BASE_URL = "https://api.twelvedata.com";
const symbolMap: Record<string, string> = {
  EURUSD: "EUR/USD", GBPUSD: "GBP/USD", USDJPY: "USD/JPY", AUDUSD: "AUD/USD", USDCAD: "USD/CAD", USDCHF: "USD/CHF", NZDUSD: "NZD/USD",
  XAUUSD: "XAU/USD", XAGUSD: "XAG/USD", SPX: "SPX", NAS100: "NDX",
};

function apiUrl(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ ...params, apikey: process.env.TWELVE_DATA_API_KEY ?? "" });
  return `${BASE_URL}${path}?${query}`;
}

function intervalFor(timeframe: string) {
  return timeframe === "1D" ? "5min" : timeframe === "1W" ? "1h" : "1day";
}

export class TwelveDataMarketDataProvider implements MarketDataProvider {
  private fallback = new MockMarketDataProvider();

  async getQuotes(instruments: BrandConfig["instruments"]): Promise<MarketQuote[]> {
    if (!instruments.length || !process.env.TWELVE_DATA_API_KEY) return this.fallback.getQuotes(instruments);
    const symbols = instruments.map((item) => symbolMap[item.symbol] ?? item.symbol).join(",");
    try {
      const response = await fetch(apiUrl("/quote", { symbol: symbols }), { next: { revalidate: 15 } });
      if (!response.ok) throw new Error("Provider unavailable");
      const data = await response.json() as Record<string, unknown>;
      const fallback = await this.fallback.getQuotes(instruments);
      return instruments.map((instrument) => {
        const requested = symbolMap[instrument.symbol] ?? instrument.symbol;
        const raw = (data[requested] ?? data[instrument.symbol] ?? data) as Record<string, string | number>;
        const price = Number(raw.close ?? raw.price);
        const previous = Number(raw.previous_close);
        if (!Number.isFinite(price)) return fallback.find((quote) => quote.symbol === instrument.symbol)!;
        const base = fallback.find((quote) => quote.symbol === instrument.symbol)!;
        const change = Number(raw.percent_change);
        return { ...base, price, change24h: Number.isFinite(change) ? change : previous ? ((price - previous) / previous) * 100 : 0, high24h: Number(raw.high) || base.high24h, low24h: Number(raw.low) || base.low24h, volume: Number(raw.volume) || 0, source: "live" as const, updatedAt: new Date().toISOString() };
      });
    } catch { return this.fallback.getQuotes(instruments); }
  }

  async getHistory(symbol: string, timeframe: string): Promise<MarketPoint[]> {
    if (!process.env.TWELVE_DATA_API_KEY) return this.fallback.getHistory(symbol, timeframe);
    try {
      const outputsize = timeframe === "1D" ? "78" : timeframe === "1W" ? "120" : timeframe === "1M" ? "90" : "260";
      const response = await fetch(apiUrl("/time_series", { symbol: symbolMap[symbol] ?? symbol, interval: intervalFor(timeframe), outputsize, format: "JSON" }), { next: { revalidate: timeframe === "1D" ? 60 : 300 } });
      if (!response.ok) throw new Error("Provider unavailable");
      const data = await response.json() as { values?: Array<{ datetime: string; close: string }> };
      if (!data.values?.length) throw new Error("No series");
      return data.values.reverse().map((point) => ({ time: point.datetime, price: Number(point.close) })).filter((point) => Number.isFinite(point.price));
    } catch { return this.fallback.getHistory(symbol, timeframe); }
  }
}
