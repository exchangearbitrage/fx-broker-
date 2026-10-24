import { notFound } from "next/navigation";
import { MarketListing } from "@/components/markets/MarketListing";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function SharesPage() {
  const brand = getBrandConfig();
  if (!brand.features.shares) notFound();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return <MarketListing title="Shares" body="Review share markets with sortable price, daily movement, range, and trend data." category="shares" quotes={quotes} currency={brand.currencyDefault} />;
}
