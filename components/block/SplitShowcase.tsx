"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type SplitItem = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  stats: Array<{ label: string; value: string }>;
};

const defaultItems: [SplitItem, SplitItem] = [
  {
    eyebrow: "For traders",
    title: "Research a market, place an order, and stay in full control",
    body: "Monitor live prices, manage account activity, follow strategy providers, and use built-in tools — all from one fast, responsive dashboard.",
    href: "/trade",
    stats: [
      { label: "Markets", value: "50+" },
      { label: "Account modes", value: "Demo / Live" },
    ],
  },
  {
    eyebrow: "Copy trading",
    title: "Mirror expert traders and earn while they work",
    body: "Select a verified strategy provider, set your copy amount, and automatically replicate their trades in real time. Stay in full control at every step.",
    href: "/copy",
    stats: [
      { label: "Strategy providers", value: "100+" },
      { label: "Avg. win rate", value: "54%+" },
    ],
  },
];

export function SplitShowcase({ items = defaultItems }: { items?: [SplitItem, SplitItem] }) {
  return (
    <div className="split-showcase">
      {items.map((item) => (
        <Link key={item.eyebrow} href={item.href} className="split-card">
          <p>{item.eyebrow}</p>
          <h3>{item.title}</h3>
          <span>{item.body}</span>
          <div>
            {item.stats.map((stat) => (
              <strong key={stat.label}>
                {stat.value}
                <small>{stat.label}</small>
              </strong>
            ))}
          </div>
          <ArrowUpRight className="split-arrow" size={20} />
        </Link>
      ))}
    </div>
  );
}
