"use client";

import { useState } from "react";

export type ImageAccordionItem = {
  title: string;
  src: string;
  alt: string;
};

type ImageAccordionProps = {
  items: ImageAccordionItem[];
  className?: string;
};

export function ImageAccordion({ items, className = "" }: ImageAccordionProps) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className={`acc ${className}`} onPointerLeave={() => setActive(0)}>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          className="acc-cell"
          data-open={active === index}
          style={{ flexGrow: active === index ? 3.4 : active === null ? 1 : 1.05 }}
          onPointerEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
          aria-label={item.title}
        >
          <img src={item.src} alt={item.alt} draggable={false} loading="lazy" />
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  );
}
