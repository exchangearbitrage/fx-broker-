import { MarkdownBlock } from "@/components/content/MarkdownBlock";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function PrivacyPage() {
  const brand = getBrandConfig();

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Privacy</p>
      <h1 className="font-heading text-5xl font-semibold">Privacy</h1>
      <div className="mt-10 rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="rounded-brand bg-brand-background/45 p-6">
          <MarkdownBlock markdown={brand.legal.privacyMarkdown} />
        </div>
      </div>
    </main>
  );
}
