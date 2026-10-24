import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  children: ReactNode;
};

export function Section({ eyebrow, title, body, children }: SectionProps) {
  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">{eyebrow}</p> : null}
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{title}</h2>
          {body ? <p className="mt-4 text-base leading-7 text-brand-secondary">{body}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
