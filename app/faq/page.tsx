"use client";

import { FaqSearch } from "@/components/faq/FaqSearch";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { useTranslation } from "@/context/LanguageContext";

export default function FaqPage() {
  const brand = getBrandConfig();
  const { t } = useTranslation();

  return (
    <main>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
          {t.faqEyebrow ?? "Support"}
        </p>
        <h1 className="font-heading text-5xl font-semibold">
          {t.faqTitle ?? "Frequently Asked Questions"}
        </h1>
        <p className="mt-5 text-lg leading-8 text-brand-secondary">
          {t.faqBody ?? "Search common questions about accounts, markets, verification, deposits, withdrawals, and platform access."}
        </p>
      </section>
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <FaqSearch items={brand.content.faq} />
      </section>
    </main>
  );
}
