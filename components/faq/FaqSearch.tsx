"use client";

import { useMemo, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqSearch({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(items[0]?.question ?? null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => !normalized || item.question.toLowerCase().includes(normalized) || item.answer.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="rounded-brand bg-brand-background/45">
        <div className="border-b border-white/10 p-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAQs" className="min-h-11 w-full rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
        </div>
        <div className="divide-y divide-white/10">
          {filtered.map((item) => (
            <div key={item.question}>
              <button type="button" onClick={() => setOpen(open === item.question ? null : item.question)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold transition-[color] duration-150 hover:text-brand-primary">
                {item.question}
                <span className="text-brand-primary">{open === item.question ? "-" : "+"}</span>
              </button>
              {open === item.question ? <p className="px-5 pb-5 text-sm leading-6 text-brand-secondary">{item.answer}</p> : null}
            </div>
          ))}
          {filtered.length ? null : <p className="p-6 text-sm text-brand-secondary">No FAQ entries match your search.</p>}
        </div>
      </div>
    </div>
  );
}
