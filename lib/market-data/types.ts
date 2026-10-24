import type { BrandConfig } from "@/config/brand.schema";

export type MarketPoint = {
  time: string;
  price: number;
};

export type MarketQuote = {
  symbol: string;
  name: string;
  category: BrandConfig["instruments"][number]["category"];
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  sparkline: number[];
  source: "live" | "delayed" | "simulated";
  updatedAt: string;
};

export type MarketDataProvider = {
  getQuotes(instruments: BrandConfig["instruments"]): Promise<MarketQuote[]>;
  getHistory(symbol: string, timeframe: string): Promise<MarketPoint[]>;
};
