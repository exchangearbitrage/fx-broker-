import Link from "next/link";
import { ActionArrowGlyph } from "@/components/icons/TradingGlyphs";
import { getBrandConfig } from "@/config/loadBrandConfig";

type PlaceholderPageProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function PlaceholderPage({ title, description, primaryHref = "/", primaryLabel = "Back to home" }: PlaceholderPageProps) {
  const brand = getBrandConfig();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">{brand.brand.name}</p>
      <h1 className="mt-4 font-heading text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">{description}</p>
      <Link href={primaryHref} className="mt-8 inline-flex w-fit items-center gap-2 rounded-brand bg-brand-primary px-5 py-3 text-sm font-semibold text-black">
        {primaryLabel}
        <ActionArrowGlyph className="h-[18px] w-[18px]" />
      </Link>
    </main>
  );
}
