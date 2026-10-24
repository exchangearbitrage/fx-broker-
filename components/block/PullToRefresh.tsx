"use client";

import { RotateCcw } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

type PullToRefreshProps = {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  className?: string;
  label?: string;
};

export function PullToRefresh({ children, onRefresh, className = "", label = "Pull to refresh" }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [working, setWorking] = useState(false);
  const startY = useRef<number | null>(null);
  const armed = pull > 64;

  useEffect(() => {
    if (!working) return;
    const timer = window.setTimeout(() => setWorking(false), 760);
    return () => window.clearTimeout(timer);
  }, [working]);

  async function finish() {
    startY.current = null;
    if (!armed) {
      setPull(0);
      return;
    }
    setWorking(true);
    setPull(38);
    await onRefresh?.();
    window.setTimeout(() => setPull(0), 420);
  }

  return (
    <div
      className={`ptr ${className}`}
      data-armed={armed}
      data-working={working}
      onPointerDown={(event) => {
        startY.current = event.clientY;
      }}
      onPointerMove={(event) => {
        if (startY.current === null || working) return;
        const next = Math.max(0, event.clientY - startY.current);
        setPull(Math.min(88, next * 0.58));
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <div className="ptr-indicator" style={{ opacity: Math.min(1, pull / 46), transform: `translateY(${Math.min(26, pull / 2)}px)` }}>
        <RotateCcw className="h-4 w-4" />
        <span>{working ? "Refreshing" : armed ? "Release to refresh" : label}</span>
      </div>
      <div className="ptr-sheet" style={{ transform: `translateY(${pull}px)` }}>
        {children}
      </div>
    </div>
  );
}
