import { notFound } from "next/navigation";
import Link from "next/link";
import { AutomationGlyph } from "@/components/icons/TradingGlyphs";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function AutomatePage() {
  const brand = getBrandConfig();
  if (!brand.features.automatedTrading) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Automation</p>
      <h1 className="font-heading text-5xl font-semibold">Rule-based demo automation</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">Create simple rules that watch selected markets and react when price crosses your chosen level.</p>
      <div className="mt-10 rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="rounded-brand bg-brand-background/45 p-6">
          <AutomationGlyph className="h-8 w-8 text-brand-primary" />
          <h2 className="mt-5 font-heading text-2xl font-semibold">Example rule</h2>
          <p className="mt-3 text-sm leading-6 text-brand-secondary">Buy BTC when price crosses a selected threshold, then apply stop-loss and take-profit values to manage risk.</p>
          <Link href="/auth/register" className="mt-6 inline-flex rounded-brand bg-brand-primary px-4 py-2.5 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">Create demo account</Link>
        </div>
      </div>
    </main>
  );
}
