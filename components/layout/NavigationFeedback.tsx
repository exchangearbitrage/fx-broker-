"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Shows feedback at the click boundary, before Next starts fetching the route. */
export function NavigationFeedback() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href || destination.hash) return;
      setIsNavigating(true);
    };
    const onPopState = () => setIsNavigating(true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => { document.removeEventListener("click", onClick, true); window.removeEventListener("popstate", onPopState); };
  }, []);

  if (!isNavigating) return null;
  return (
    <div aria-live="polite" aria-label="Loading next page" className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div className="h-1 overflow-hidden bg-white/10"><div className="navigation-progress h-full w-2/5 rounded-r-full bg-brand-primary" /></div>
      <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-brand-surface/95 px-3 py-1.5 text-xs font-medium text-brand-text shadow-xl backdrop-blur-xl">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" /> Loading workspace…
      </div>
    </div>
  );
}
