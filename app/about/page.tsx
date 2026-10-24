"use client";

import { getBrandConfig } from "@/config/loadBrandConfig";
import { BadgeCheck, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function AboutPage() {
  const brand = getBrandConfig();
  const { t } = useTranslation();

  const highlights = [
    {
      icon: ShieldCheck,
      title: t.aboutRegulatedTitle ?? "Fully regulated",
      body: t.aboutRegulatedBody ?? "Licensed under international financial regulations across all operating regions. We publish our compliance framework and regulatory status transparently.",
    },
    {
      icon: BadgeCheck,
      title: t.aboutAwardTitle ?? "Award-winning",
      body: t.aboutAwardBody ?? "Recognised for best execution quality and customer satisfaction multiple years running — by traders, for traders.",
    },
    {
      icon: Globe,
      title: t.aboutGlobalTitle ?? "Truly global",
      body: t.aboutGlobalBody ?? "Serving clients in 180+ countries with localised support, multilingual interfaces, and payment methods tailored to each region.",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Eyebrow */}
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
        {t.aboutEyebrow ?? "Who we are"}
      </p>

      {/* Headline */}
      <h1
        className="font-heading text-5xl font-semibold"
        style={{ textWrap: "balance" } as React.CSSProperties}
      >
        {t.aboutTitle ?? "Built by traders, for traders"}
      </h1>

      {/* Body */}
      <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-secondary" style={{ textWrap: "pretty" } as React.CSSProperties}>
        {brand.brand.name} {t.aboutP1 ?? "was founded with a single mission: give every person on the planet access to the world's financial markets. We are a multi-asset brokerage serving clients across 180+ countries with transparent pricing, tight spreads, and award-winning support."}
      </p>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-secondary" style={{ textWrap: "pretty" } as React.CSSProperties}>
        {t.aboutP2 ?? "Our team of engineers and financial professionals work every day to ensure execution reliability, regulatory compliance, and a trading experience that never settles for second best."}
      </p>

      {/* Stats grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { value: "2018", label: t.statFounded ?? "Founded" },
          { value: "150K+", label: t.statActiveTraders ?? "Active traders" },
          { value: "180+", label: t.statCountries ?? "Countries served" },
          { value: "50+", label: t.statMarkets ?? "Global markets" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border"
          >
            <p className="font-heading text-2xl font-semibold tabular-nums text-brand-primary">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-brand-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border"
            >
              <Icon className="h-7 w-7 text-brand-primary" />
              <h2
                className="mt-5 font-heading text-lg font-semibold"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-secondary">{item.body}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-brand bg-brand-primary px-5 py-3 text-sm font-semibold text-black transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
        >
          {t.aboutCta1 ?? "Create free account"}
        </Link>
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center rounded-brand border border-white/10 px-5 py-3 text-sm font-semibold transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]"
        >
          {t.aboutCta2 ?? "Contact us"}
        </Link>
      </div>
    </main>
  );
}
