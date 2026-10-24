import { MarketChart } from "@/components/markets/MarketChart";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { LinkButton } from "@/components/ui/Button";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";
import { getCurrentUser } from "@/lib/auth/session";
import { TradeOrderTicket } from "@/components/markets/TradeOrderTicket";

export const dynamic = "force-dynamic";

type TradePageProps = {
  searchParams: Promise<{
    symbol?: string;
  }>;
};

export default async function TradePage({ searchParams }: TradePageProps) {
  const { symbol } = await searchParams;
  const brand = getBrandConfig();
  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const selected = quotes.find((quote) => quote.symbol === symbol) ?? quotes[0];
  const histories = {
    "1D": await provider.getHistory(selected.symbol, "1D"),
    "1W": await provider.getHistory(selected.symbol, "1W"),
    "1M": await provider.getHistory(selected.symbol, "1M"),
    "1Y": await provider.getHistory(selected.symbol, "1Y"),
  };

  const user = await getCurrentUser();

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Trade Desk</p>
          <h1 className="font-heading text-5xl font-semibold">Trade {selected.symbol}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">
            Review the selected market, analyse price action, and place orders directly from your live account.
          </p>
          <div className="mt-8">
            <MarketChart symbol={selected.symbol} currency={brand.currencyDefault} histories={histories} />
          </div>
        </div>

        <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
          {user ? <TradeOrderTicket user={user} instrument={selected} currency={brand.currencyDefault} /> : <TradingAccessPrompt />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={6} />
      </section>
    </main>
  );
}

function TradingAccessPrompt() {
  return (
    <aside className="flex min-h-[31rem] flex-col justify-between rounded-brand bg-brand-background/45 p-6 sm:p-8">
      <div>
        <p className="inline-flex rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary">Live trading</p>
        <h2 className="mt-5 font-heading text-3xl font-bold text-white">Sign in to place a trade</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-brand-secondary">You can explore live market prices here. To open an order ticket or view a balance, sign in to your own secure account.</p>
      </div>
      <div className="space-y-3">
        <LinkButton href="/auth/login?redirect=%2Ftrade" className="w-full justify-center">Sign in to trade</LinkButton>
        <LinkButton href="/auth/register" variant="secondary" className="w-full justify-center">Create a free account</LinkButton>
      </div>
    </aside>
  );
}
