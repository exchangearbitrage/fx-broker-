"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EducationArticle } from "@/lib/education";
import { getArticleSlug } from "@/lib/education";

type EducationHubProps = {
  articles: EducationArticle[];
};

export function EducationHub({ articles }: EducationHubProps) {
  const categories = ["all", ...Array.from(new Set(articles.map((article) => article.category)))];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return articles.filter((article) => {
      const categoryMatch = category === "all" || article.category === category;
      const queryMatch =
        !normalized ||
        article.title.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized) ||
        article.category.toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [articles, category, query]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles"
          className="min-h-11 rounded-brand border border-white/10 bg-brand-background/45 px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 rounded-brand border border-white/10 bg-brand-background/45 px-4 text-sm">
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((article) => (
          <Link key={article.title} href={`/for-traders/${getArticleSlug(article)}`} className="group rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">{article.category}</p>
            <h2 className="mt-4 font-heading text-xl font-semibold group-hover:text-brand-primary">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">{article.excerpt}</p>
            <p className="mt-5 text-xs text-brand-secondary">{article.readingMinutes} min read</p>
          </Link>
        ))}
      </div>

      {filtered.length ? null : <p className="rounded-brand bg-brand-surface p-5 text-sm text-brand-secondary shadow-border">No articles match your filters.</p>}
    </div>
  );
}
