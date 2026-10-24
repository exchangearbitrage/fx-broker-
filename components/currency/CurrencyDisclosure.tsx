"use client";

import { useCurrency } from "@/context/CurrencyContext";

export function CurrencyDisclosure() {
  const { currency } = useCurrency();
  if (currency === "USD") return null;
  return <p className="text-xs text-brand-secondary">Shown in {currency} at an indicative rate. Your account balance and trades settle in USD.</p>;
}