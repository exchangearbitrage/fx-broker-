import { notFound } from "next/navigation";
import { MarketListing } from "@/components/markets/MarketListing";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function IndicesPage() {
  const brand = getBrandConfig();
  if (!brand.features.indices) notFound();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return <MarketListing title="Indices" body="Track index markets with responsive listings, trend views, and detailed market pages." category="indices" quotes={quotes} currency={brand.currencyDefault} />;
}
