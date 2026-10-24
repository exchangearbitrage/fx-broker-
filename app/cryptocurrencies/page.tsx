import { notFound } from "next/navigation";
import { MarketListing } from "@/components/markets/MarketListing";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function CryptocurrenciesPage() {
  const brand = getBrandConfig();
  if (!brand.features.cryptoTrading) notFound();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return <MarketListing title="Cryptocurrencies" body="Follow leading digital assets with automatically refreshing prices, market movement, and trade-ready detail pages." category="crypto" quotes={quotes} currency={brand.currencyDefault} />;
}
