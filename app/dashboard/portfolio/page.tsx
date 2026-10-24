import { getBrandConfig } from "@/config/loadBrandConfig";
import { AssetsTreasuryView } from "@/components/portal/AssetsTreasuryView";

export const metadata = {
  title: "Assets & Treasury Management",
  description: "Consolidated holdings, account balances, capital deposits, and transaction ledgers.",
};

export default function PortfolioPage() {
  const brand = getBrandConfig();
  return <AssetsTreasuryView currency={brand.currencyDefault} />;
}
