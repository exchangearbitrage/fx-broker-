import { formatMoney } from "@/lib/fx/rates";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined, currency = "USD") {
  return formatMoney(value, { currency });
}

export function formatPercent(value: number | null | undefined) {
  const percentage = Number.isFinite(value) ? Number(value) : 0;
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
