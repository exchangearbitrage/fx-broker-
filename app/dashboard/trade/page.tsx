import { getCurrentUser } from "@/lib/auth/session";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";
import { TradeOrderTicket } from "@/components/markets/TradeOrderTicket";
import { MarketChart } from "@/components/markets/MarketChart";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Trade Desk",
  description: "Execute live orders across crypto, forex, indices, and shares with up to 100x leverage.",
};

type TradePageProps = {
  searchParams: Promise<{ symbol?: string }>;
};

export default async function DashboardTradePage({ searchParams }: TradePageProps) {
  const { symbol } = await searchParams;
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard%2Ftrade");

  const brand = getBrandConfig();
  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const selected = quotes.find((q) => q.symbol === symbol) ?? quotes[0];
  const histories = {
    "1D": await provider.getHistory(selected.symbol, "1D"),
    "1W": await provider.getHistory(selected.symbol, "1W"),
    "1M": await provider.getHistory(selected.symbol, "1M"),
    "1Y": await provider.getHistory(selected.symbol, "1Y"),
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="border-b border-white/10 pb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">Trade Desk</p>
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          {selected.name}
          <span className="ml-3 font-mono text-xl font-normal text-brand-secondary">{selected.symbol}</span>
        </h1>
        <p className="mt-2 text-sm text-brand-secondary">
          Multi-asset execution with up to 100× leverage. Select an instrument below or from the market table.
        </p>
      </div>

      {/* Main grid: chart + order ticket */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Chart */}
        <div className="rounded-2xl border border-white/10 bg-brand-surface/60 p-4 backdrop-blur-md">
          <MarketChart symbol={selected.symbol} currency={brand.currencyDefault} histories={histories} />
        </div>

        {/* Authenticated order ticket */}
        <div className="rounded-2xl border border-white/10 bg-brand-surface/60 backdrop-blur-md overflow-hidden">
          <TradeOrderTicket user={user} instrument={selected} currency={brand.currencyDefault} />
        </div>
      </div>

      {/* Market scanner table */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-bold text-white">Market Scanner</h2>
        <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={8} />
      </div>
    </div>
  );
}
