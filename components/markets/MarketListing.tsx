import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { Section } from "@/components/ui/Section";
import type { MarketQuote } from "@/lib/market-data/types";

type MarketListingProps = {
  title: string;
  body: string;
  category: string;
  quotes: MarketQuote[];
  currency: string;
};

export function MarketListing({ title, body, category, quotes, currency }: MarketListingProps) {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">{category}</p>
        <h1 className="font-heading text-5xl font-semibold">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">{body}</p>
      </section>
      <Section title="Available Markets" body="Compare prices, daily movement, trading range, and short-term trend across available markets.">
        <LiveMarketTable quotes={quotes} currency={currency} initialCategory={category} pageSize={10} />
      </Section>
    </main>
  );
}
