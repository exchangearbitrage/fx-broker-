import { notFound } from "next/navigation";
import { MarketListing } from "@/components/markets/MarketListing";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function ForexPage() {
  const brand = getBrandConfig();
  if (!brand.features.forex) notFound();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return <MarketListing title="Forex" body="Explore major currency pairs with searchable listings and direct trade entry links." category="forex" quotes={quotes} currency={brand.currencyDefault} />;
}
