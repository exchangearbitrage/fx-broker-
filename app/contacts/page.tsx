"use client";

import { ContactForm } from "@/components/contact/ContactForm";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { useTranslation } from "@/context/LanguageContext";

export default function ContactsPage() {
  const brand = getBrandConfig();
  const { t } = useTranslation();

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
            {t.contactEyebrow ?? "Contact"}
          </p>
          <h1 className="font-heading text-5xl font-semibold">
            {t.contactTitle ?? "Talk to support"}
          </h1>
          <p className="mt-5 text-lg leading-8 text-brand-secondary">
            {t.contactBody ?? "Send a message to the support team for account access, verification, platform, or funding questions."}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-brand-secondary">
            {brand.brand.supportEmail ? <a href={`mailto:${brand.brand.supportEmail}`} className="hover:text-brand-text">{brand.brand.supportEmail}</a> : null}
            {brand.brand.supportPhone ? <a href={`tel:${brand.brand.supportPhone}`} className="hover:text-brand-text">{brand.brand.supportPhone}</a> : null}
            {brand.brand.address ? <p>{brand.brand.address}</p> : null}
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
