import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyGlyph } from "@/components/icons/TradingGlyphs";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function CopyPage() {
  const brand = getBrandConfig();
  if (!brand.features.copyTrading) notFound();

  const providers = ["Balanced Demo", "Momentum Demo", "Low Volatility Demo"];

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Copy Trading</p>
      <h1 className="font-heading text-5xl font-semibold">Discover demo strategy providers</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">Compare strategy profiles by risk style, market focus, and recent performance before choosing an allocation.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {providers.map((provider, index) => (
          <div key={provider} className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border">
            <CopyGlyph className="h-7 w-7 text-brand-primary" />
            <h2 className="mt-5 font-heading text-xl font-semibold">{provider}</h2>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">Risk score {index + 3}/10. Review performance, drawdown, market focus, and allocation controls before copying.</p>
            <Link href="/auth/register" className="mt-6 inline-flex rounded-brand bg-brand-primary px-4 py-2.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">Start with demo</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
