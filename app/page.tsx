import { HomeSections } from "@/components/marketing/HomeSections";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export default async function HomePage() {
  const brand = getBrandConfig();
  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const primarySymbol = quotes[0]?.symbol ?? brand.instruments[0]?.symbol ?? "BTC";
  const histories = {
    "1D": await provider.getHistory(primarySymbol, "1D"),
    "1W": await provider.getHistory(primarySymbol, "1W"),
    "1M": await provider.getHistory(primarySymbol, "1M"),
    "1Y": await provider.getHistory(primarySymbol, "1Y"),
  };

  return <HomeSections brand={brand} quotes={quotes} histories={histories} />;
}
