import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionArrowGlyph } from "@/components/icons/TradingGlyphs";
import { MarkdownBlock } from "@/components/content/MarkdownBlock";
import { getArticleBySlug } from "@/lib/education";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">{article.category}</p>
        <h1 className="font-heading text-5xl font-semibold">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-brand-secondary">{article.excerpt}</p>
        <div className="mt-10 rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
          <div className="rounded-brand bg-brand-background/45 p-6">
            <MarkdownBlock markdown={article.markdown} />
          </div>
        </div>
        <Link href="/for-traders" className="mt-8 inline-flex items-center gap-2 rounded-brand bg-brand-surface px-4 py-2.5 text-sm font-semibold shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96]">
          Back to education
          <ActionArrowGlyph className="h-[18px] w-[18px]" />
        </Link>
      </article>
    </main>
  );
}
