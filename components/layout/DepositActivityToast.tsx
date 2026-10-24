"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDownToLine, ArrowUpRight, Users, X } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Notification pool ────────────────────────────────────────────────────────
// Simulates the kind of platform activity shown in Trado's reference screenshot
const EVENTS = [
  { kind: "deposit", location: "Hong Kong", amount: 52478, method: "USDT", label: "New Deposit", copy: "deposited via" }, { kind: "trade", location: "Dubai", amount: 31600, method: "BTC/USD", label: "New Trade", copy: "opened a position on" }, { kind: "copy_trading", location: "Abu Dhabi", amount: 151138, method: "Sarah K.", label: "Copy Trading", copy: "copied" }, { kind: "deposit", location: "Singapore", amount: 18920, method: "USDC", label: "New Deposit", copy: "deposited via" }, { kind: "trade", location: "London", amount: 7450, method: "XAUUSD", label: "New Trade", copy: "opened a position on" }, { kind: "copy_trading", location: "Sydney", amount: 22750, method: "James R.", label: "Copy Trading", copy: "copied" }, { kind: "deposit", location: "Toronto", amount: 9680, method: "BTC", label: "New Deposit", copy: "deposited via" }, { kind: "trade", location: "Frankfurt", amount: 44200, method: "EUR/USD", label: "New Trade", copy: "opened a position on" }, { kind: "copy_trading", location: "Riyadh", amount: 88400, method: "Alex M.", label: "Copy Trading", copy: "copied" }, { kind: "deposit", location: "Johannesburg", amount: 5310, method: "USDT", label: "New Deposit", copy: "deposited via" }, { kind: "trade", location: "Tokyo", amount: 61900, method: "BTC/USD", label: "New Trade", copy: "opened a position on" }, { kind: "copy_trading", location: "New York", amount: 34500, method: "Priya T.", label: "Copy Trading", copy: "copied" }, { kind: "deposit", location: "Lagos", amount: 12050, method: "ETH", label: "New Deposit", copy: "deposited via" }, { kind: "trade", location: "São Paulo", amount: 28740, method: "TSLA", label: "New Trade", copy: "opened a position on" }, { kind: "copy_trading", location: "Amsterdam", amount: 73200, method: "Kevin D.", label: "Copy Trading", copy: "copied" },
];

// Icon per event kind
function EventIcon({ kind }: { kind: string }) {
  const base = "grid h-10 w-10 shrink-0 place-items-center rounded-full";
  if (kind === "copy_trading") {
    return (
      <span className={`${base} bg-brand-primary/15 text-brand-primary`}>
        <Users className="h-5 w-5" />
      </span>
    );
  }
  if (kind === "trade") {
    return (
      <span className={`${base} bg-blue-500/15 text-blue-400`}>
        <ArrowUpRight className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className={`${base} bg-brand-primary/15 text-brand-primary`}>
      <ArrowDownToLine className="h-5 w-5" />
    </span>
  );
}

// Build human-readable message
function buildMessage(event: (typeof EVENTS)[number], amount: string): string {
  if (event.kind === "copy_trading") {
    return `Trader from ${event.location} copied ${event.method} with ${amount}`;
  }
  if (event.kind === "trade") {
    return `Trader from ${event.location} opened a ${amount} position on ${event.method}`;
  }
  return `Investor from ${event.location} deposited ${amount} via ${event.method}`;
}

// Live UTC time string, e.g. "03:31 UTC"
function useUTCTime() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")} UTC`;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")} UTC`);
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function DepositActivityToast() {
  const { formatMoney } = useCurrency();
  const [eventIndex, setEventIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const utcTime = useUTCTime();

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const show = () => {
      // Pick a random event, different from the previous one
      setEventIndex((prev) => {
        let next: number;
        do { next = Math.floor(Math.random() * EVENTS.length); } while (next === prev && EVENTS.length > 1);
        return next;
      });
      setMounted(true);
      // Small rAF delay lets the element mount before we flip visible → true
      // so the CSS transition animates from the starting state
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    };

    // Auto-dismiss after 7 seconds, then re-show every 1.5 minutes (90s)
    let hideTimer: number | undefined;
    let showTimer: number | undefined;
    const DISPLAY_DURATION_MS = 7_000;
    const INTERVAL_MS = 90_000; // 1.5 minutes

    const schedule = () => {
      showTimer = window.setTimeout(() => {
        show();
        hideTimer = window.setTimeout(() => {
          setVisible(false);
          schedule();
        }, DISPLAY_DURATION_MS);
      }, INTERVAL_MS);
    };

    // First notification after 3 seconds
    const first = window.setTimeout(() => {
      show();
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        schedule();
      }, DISPLAY_DURATION_MS);
    }, 3_000);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
    };
  }, []);

  if (!mounted || eventIndex === null) return null;
  const event = EVENTS[eventIndex];

  return (
    /*
     * Emil Kowalski pattern: transition on transform + opacity only (GPU-composited).
     * Starts at translateY(100%) opacity-0, transitions to translateY(0) opacity-1.
     * Uses strong ease-out curve for snappy entrance, ease-in for exit.
     * Scale on the dismiss button gives tactile feedback (Jakub Krehel rule).
     */
    <div
      role="status"
      aria-live="polite"
      aria-label="Platform activity notification"
      style={{
        transform: visible ? "translateY(0)" : "translateY(calc(100% + 1.5rem))",
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 380ms cubic-bezier(0.23, 1, 0.32, 1), opacity 280ms ease"
          : "transform 240ms cubic-bezier(0.4, 0, 1, 1), opacity 200ms ease",
        willChange: "transform, opacity",
      }}
      className="fixed bottom-5 left-5 z-[60] w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-white/10 bg-brand-surface/96 p-4 shadow-2xl backdrop-blur-xl"
    >
      {/* Dismiss — scale-on-press from Jakub Krehel */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={dismiss}
        className="absolute right-3 top-3 text-brand-secondary transition-[color,transform] duration-150 hover:text-brand-text active:scale-[0.88]"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <EventIcon kind={event.kind} />
        <div className="min-w-0 pr-4">
          {/* Eyebrow label */}
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
            {event.label}
          </p>
          {/* Message — text-wrap: balance keeps it tidy (Jakub Krehel) */}
          <p className="mt-1 text-sm font-medium leading-snug" style={{ textWrap: "balance" } as React.CSSProperties}>
            {buildMessage(event, formatMoney(event.amount))}
          </p>
          {/* Timestamp — tabular-nums prevents layout shift (Jakub Krehel) */}
          <p className="mt-2 text-xs tabular-nums text-brand-secondary">
            {utcTime}
          </p>
        </div>
      </div>
    </div>
  );
}
