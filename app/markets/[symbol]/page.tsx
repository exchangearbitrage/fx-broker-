import { notFound } from "next/navigation";
import Link from "next/link";
import { ActionArrowGlyph } from "@/components/icons/TradingGlyphs";
import { MarketChart } from "@/components/markets/MarketChart";
import { Sparkline } from "@/components/markets/Sparkline";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";
import { formatCurrency, formatPercent } from "@/lib/utils";

type MarketDetailPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { symbol } = await params;
  const brand = getBrandConfig();
  const instrument = brand.instruments.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase());

  if (!instrument) {
    notFound();
  }

  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const quote = quotes.find((item) => item.symbol === instrument.symbol);
  if (!quote) notFound();

  const histories = {
    "1D": await provider.getHistory(instrument.symbol, "1D"),
    "1W": await provider.getHistory(instrument.symbol, "1W"),
    "1M": await provider.getHistory(instrument.symbol, "1M"),
    "1Y": await provider.getHistory(instrument.symbol, "1Y"),
  };

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">{instrument.category}</p>
          <h1 className="mt-4 font-heading text-5xl font-semibold">{instrument.name}</h1>
          <p className="mt-3 text-xl text-brand-secondary">{instrument.symbol}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Stat label="Price" value={formatCurrency(quote.price, brand.currencyDefault)} />
            <Stat label="24h change" value={formatPercent(quote.change24h)} tone={quote.change24h >= 0 ? "positive" : "negative"} />
            <Stat label="24h low" value={formatCurrency(quote.low24h, brand.currencyDefault)} />
            <Stat label="24h high" value={formatCurrency(quote.high24h, brand.currencyDefault)} />
          </div>
          <div className="mt-6">
            <Sparkline points={quote.sparkline} positive={quote.change24h >= 0} className="h-20 w-full" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/trade?symbol=${encodeURIComponent(instrument.symbol)}`} className="inline-flex items-center gap-2 rounded-brand bg-brand-primary px-5 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
              Trade this market
              <ActionArrowGlyph className="h-[18px] w-[18px]" />
            </Link>
            <Link href={`/${instrument.category === "crypto" ? "cryptocurrencies" : instrument.category}`} className="inline-flex items-center rounded-brand bg-brand-surface px-5 py-3 text-sm font-semibold shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96]">
              Back to listing
            </Link>
          </div>
        </div>
        <MarketChart symbol={instrument.symbol} currency={brand.currencyDefault} histories={histories} />
      </section>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="rounded-[calc(var(--radius-brand)+6px)] bg-brand-surface p-4 shadow-border">
      <p className="text-xs uppercase tracking-[0.14em] text-brand-secondary">{label}</p>
      <p className={tone === "positive" ? "mt-2 font-heading text-xl font-semibold text-brand-success" : tone === "negative" ? "mt-2 font-heading text-xl font-semibold text-brand-danger" : "mt-2 font-heading text-xl font-semibold"}>{value}</p>
    </div>
  );
}
