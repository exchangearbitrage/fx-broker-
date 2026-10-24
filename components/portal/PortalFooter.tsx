"use client";

import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";

export function PortalFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-brand-surface/30 py-8 text-xs text-brand-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              STP Order Gateway: Operational (7.2ms)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
              Air-Gapped Cold Storage 95%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contacts" className="hover:text-white transition-colors">24/7 Desk Support</Link>
            <Link href="/faq" className="hover:text-white transition-colors">Help Center</Link>
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Rates By Exchange Rate API</a>
          </div>
        </div>

        <p className="mt-4 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-white/40">
          Risk Warning: Trading financial instruments, contracts for difference (CFDs), foreign exchange, and digital assets carries high risk and may not be suitable for all investors. High leverage can work against you as well as for you. Please ensure you understand all risks before trading.
        </p>
      </div>
    </footer>
  );
}
