import { slugify } from "@/lib/utils";

export type EducationArticle = {
  title: string;
  category: string;
  excerpt: string;
  readingMinutes: number;
  markdown: string;
};

export const educationArticles: EducationArticle[] = [
  {
    title: "Getting Started With Demo Trading",
    category: "Platform",
    excerpt: "Learn how demo mode separates practice activity from live broker and payment integrations.",
    readingMinutes: 4,
    markdown: "Demo trading uses virtual balances and simulated ledger activity. Review every flow before considering live integrations.",
  },
  {
    title: "Reading A Market Quote",
    category: "Markets",
    excerpt: "Understand price, daily movement, range, and trend visuals used across the platform.",
    readingMinutes: 3,
    markdown: "A market quote combines the latest price, recent movement, 24-hour high and low, and a compact trend line.",
  },
  {
    title: "Order Types In Plain Language",
    category: "Trading",
    excerpt: "A simple overview of market orders, limit orders, and risk controls.",
    readingMinutes: 5,
    markdown: "Market orders execute at the available demo price. Limit orders wait for a selected target. Stops and take-profit values define exit conditions.",
  },
  {
    title: "What Copy Trading Means",
    category: "Copy Trading",
    excerpt: "A neutral explanation of strategy following without making performance claims.",
    readingMinutes: 4,
    markdown: "Copy trading lets a user allocate demo funds to follow a strategy profile. Past movement is not a guarantee of future results.",
  },
  {
    title: "Automated Trading Rules",
    category: "Automation",
    excerpt: "How rule-based bots can evaluate market prices in demo mode.",
    readingMinutes: 4,
    markdown: "A bot rule can watch for a price crossing a threshold, then create a demo order when the condition is met.",
  },
  {
    title: "Understanding Risk Warnings",
    category: "Risk",
    excerpt: "Where legal and risk language should come from in a white-label deployment.",
    readingMinutes: 3,
    markdown: "Risk warnings explain the possibility of loss, product limitations, leverage exposure, and other important account considerations.",
  },
  {
    title: "Market Categories",
    category: "Markets",
    excerpt: "How crypto, forex, shares, indices, ETFs, and other market classes fit together.",
    readingMinutes: 3,
    markdown: "Each instrument has a symbol, name, category, and optional icon. Disabled categories disappear from the UI.",
  },
  {
    title: "Preparing For Launch",
    category: "Compliance",
    excerpt: "A checklist mindset for legal, broker, payment, support, and operational readiness.",
    readingMinutes: 6,
    markdown: "Before live launch, complete licensing review, broker integration, payment integration, KYC operations, support policy, and security checks.",
  },
];

export function getArticleSlug(article: EducationArticle) {
  return slugify(article.title);
}

export function getArticleBySlug(slug: string) {
  return educationArticles.find((article) => getArticleSlug(article) === slug);
}
