"use client";

import Link from "next/link";
import { MarketGlyph, TradeGlyph, TrustGlyph } from "@/components/icons/TradingGlyphs";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { useTranslation } from "@/context/LanguageContext";

export default function WhyUsPage() {
  const brand = getBrandConfig();
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
        {t.whyUsEyebrow ?? "Why Us"}
      </p>
      <h1 className="font-heading text-5xl font-semibold">
        {t.whyUsTitle ?? brand.content.sections.find((section) => section.id === "why-trade")?.title ?? "Why choose us"}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">
        {t.whyUsBody ?? brand.content.sections.find((section) => section.id === "why-trade")?.body}
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { title: t.why2Title ?? "Multi-asset markets", href: "/trade", body: t.why2Body ?? "Access crypto, currencies, shares, indices, and funds from one platform.", glyph: MarketGlyph },
          { title: t.feat4Title ?? "Practice account", href: "/auth/register", body: t.feat4Body ?? "Use virtual funds to learn the platform before live trading.", glyph: TradeGlyph },
          { title: t.sec3Title ?? "Clear risk information", href: "/regulation", body: t.sec3Body ?? "Review available legal and risk information before you trade.", glyph: TrustGlyph },
        ].map((item) => {
          const Glyph = item.glyph;
          return (
            <Link key={item.href} href={item.href} className="group rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96]">
              <Glyph className="h-7 w-7 text-brand-primary" />
              <h2 className="mt-5 font-heading text-xl font-semibold group-hover:text-brand-primary">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-brand-secondary">{item.body}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
