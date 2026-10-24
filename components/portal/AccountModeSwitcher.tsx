"use client";

type AccountType = "LIVE" | "DEMO";

export function AccountModeSwitcher({ value, onChange, className = "" }: { value: AccountType; onChange: (value: AccountType) => void; className?: string }) {
  return <div className={`inline-flex rounded-xl border border-white/10 bg-black/20 p-1 ${className}`} role="group" aria-label="Trading account mode">{(["LIVE", "DEMO"] as const).map((mode) => <button key={mode} type="button" onClick={() => onChange(mode)} aria-pressed={value === mode} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${value === mode ? mode === "LIVE" ? "bg-brand-primary text-black" : "bg-emerald-500 text-black" : "text-brand-secondary hover:text-white"}`}>{mode === "LIVE" ? "Live" : "Demo"}</button>)}</div>;
}