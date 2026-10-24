import { notFound } from "next/navigation";
import { MarketListing } from "@/components/markets/MarketListing";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function EtfsPage() {
  const brand = getBrandConfig();
  if (!brand.features.etfs) notFound();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return <MarketListing title="ETFs" body="Browse exchange-traded funds with consistent market data, trend views, and trade links." category="etfs" quotes={quotes} currency={brand.currencyDefault} />;
}
