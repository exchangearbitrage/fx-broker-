import type { BrandConfig } from "@/config/brand.schema";
import type { MarketDataProvider, MarketPoint, MarketQuote } from "@/lib/market-data/types";

const basePrices: Record<string, number> = {
  BTC: 68400,
  ETH: 3450,
  EURUSD: 1.08,
  GBPUSD: 1.27,
  AAPL: 226,
  SPX: 5480,
  QQQ: 475,
};

function hash(input: string) {
  return input.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function seededWave(symbol: string, count: number, base: number) {
  const seed = hash(symbol);
  const values: number[] = [];
  let current = base;

  for (let index = 0; index < count; index += 1) {
    const drift = Math.sin((index + seed) / 4) * 0.012;
    const pulse = Math.cos((index + seed) / 7) * 0.007;
    current = Math.max(base * 0.2, current * (1 + drift + pulse));
    values.push(Number(current.toFixed(base < 10 ? 5 : 2)));
  }

  return values;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getQuotes(instruments: BrandConfig["instruments"]): Promise<MarketQuote[]> {
    return instruments.map((instrument) => {
      const base = basePrices[instrument.symbol] ?? 100 + hash(instrument.symbol);
      const sparkline = seededWave(instrument.symbol, 28, base);
      const price = sparkline[sparkline.length - 1];
      const open = sparkline[0];
      const change24h = ((price - open) / open) * 100;

      return {
        symbol: instrument.symbol,
        name: instrument.name,
        category: instrument.category,
        price,
        change24h,
        high24h: Math.max(...sparkline),
        low24h: Math.min(...sparkline),
        volume: Math.round((hash(instrument.symbol) * 98531) % 900000000),
        sparkline,
        source: "simulated",
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async getHistory(symbol: string, timeframe: string): Promise<MarketPoint[]> {
    const countByTimeframe: Record<string, number> = { "1D": 36, "1W": 56, "1M": 60, "1Y": 72 };
    const count = countByTimeframe[timeframe] ?? 36;
    const base = basePrices[symbol] ?? 100 + hash(symbol);

    return seededWave(`${symbol}-${timeframe}`, count, base).map((price, index) => ({
      time: `${index + 1}`,
      price,
    }));
  }
}
