import { CoinGeckoMarketDataProvider } from "@/lib/market-data/coingecko";
import { MockMarketDataProvider } from "@/lib/market-data/mock";
import type { MarketDataProvider } from "@/lib/market-data/types";
import { TwelveDataMarketDataProvider } from "@/lib/market-data/twelve-data";
import type { BrandConfig } from "@/config/brand.schema";
import { getBrandConfig } from "@/config/loadBrandConfig";

class HybridMarketDataProvider implements MarketDataProvider {
  private crypto = new CoinGeckoMarketDataProvider();
  private traditional = new TwelveDataMarketDataProvider();
  async getQuotes(instruments: BrandConfig["instruments"]) {
    const crypto = instruments.filter((item) => item.category === "crypto");
    const traditional = instruments.filter((item) => item.category !== "crypto");
    const [cryptoQuotes, traditionalQuotes] = await Promise.all([this.crypto.getQuotes(crypto), this.traditional.getQuotes(traditional)]);
    return instruments.map((item) => [...cryptoQuotes, ...traditionalQuotes].find((quote) => quote.symbol === item.symbol)!).filter(Boolean);
  }
  async getHistory(symbol: string, timeframe: string) {
    const config = getBrandConfig();
    return config.instruments.find((item) => item.symbol === symbol)?.category === "crypto" ? this.crypto.getHistory(symbol, timeframe) : this.traditional.getHistory(symbol, timeframe);
  }
}

export function getMarketDataProvider(): MarketDataProvider {
  if (process.env.MARKET_DATA_PROVIDER === "mock") return new MockMarketDataProvider();
  return new HybridMarketDataProvider();
}
