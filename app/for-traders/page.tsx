import { notFound } from "next/navigation";
import { EducationHub } from "@/components/education/EducationHub";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { educationArticles } from "@/lib/education";

export default function ForTradersPage() {
  const brand = getBrandConfig();
  if (!brand.features.education) notFound();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Education</p>
        <h1 className="font-heading text-5xl font-semibold">For Traders</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">Build a stronger trading routine with practical guides on markets, order types, automation, and risk controls.</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <EducationHub articles={educationArticles} />
      </section>
    </main>
  );
}
