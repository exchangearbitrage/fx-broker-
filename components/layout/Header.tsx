"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ActionArrowGlyph, CloseGlyph, MenuGlyph, MoonGlyph, SunGlyph } from "@/components/icons/TradingGlyphs";
import { formatFxTimestamp, RegionControl } from "@/components/layout/RegionControl";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getEnabledMarketNavItems, getPrimaryNavItems } from "@/lib/features";

import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

export function Header() {
  const brand = getBrandConfig();
  const { t } = useTranslation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const pathname = usePathname() ?? "";
  const marketItems = getEnabledMarketNavItems(brand);
  const toolsItems = getPrimaryNavItems(brand).filter((item) => ["Copy Trading", "Automated Trading", "Education"].includes(item.label));
  const companyItems = [
    { label: t.whyUs ?? "Why us", href: "/why-us" },
    { label: t.about ?? "About", href: "/about" },
    { label: t.faq ?? "FAQ", href: "/faq" },
    { label: t.contact ?? "Contact", href: "/contacts" },
  ];
  const mobileSections = [
    { label: t.markets ?? "Markets", items: marketItems },
    { label: t.tools ?? "Tools", items: toolsItems },
    { label: t.company ?? "Company", items: companyItems },
  ];
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<"markets" | "tools" | "company" | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { updatedAt, notice } = useCurrency();
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(null); setOpen(false); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    const style = document.createElement("style");
    style.append(document.createTextNode("*,*::before,*::after{transition:none !important}"));
    document.head.append(style);
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.body.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => style.remove());
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${brand.brand.name} home`} className="shrink-0">
          <BrandLogo />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center rounded-full border border-white/10 bg-white/[0.035] p-1 lg:flex">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm transition-[background-color,color] duration-150 ${pathname === "/" ? "bg-brand-primary text-black" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text"}`}>Home</Link>
          <Link
            href="/trade"
            aria-current={pathname === "/trade" ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm transition-[background-color,color] duration-150 ${pathname === "/trade" ? "bg-brand-primary text-black" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text"}`}
          >
            {t.trade ?? "Trade"}
          </Link>
          {isAuthenticated && <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm transition-[background-color,color] duration-150 ${pathname === "/dashboard" ? "bg-brand-primary text-black" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text"}`}
          >
            {t.dashboard ?? "Dashboard"}
          </Link>}
          <HeaderMenu label={t.markets ?? "Markets"} open={menuOpen === "markets"} onOpen={() => setMenuOpen(menuOpen === "markets" ? null : "markets")} items={marketItems} onClose={() => setMenuOpen(null)} />
          <HeaderMenu label={t.tools ?? "Tools"} open={menuOpen === "tools"} onOpen={() => setMenuOpen(menuOpen === "tools" ? null : "tools")} items={toolsItems} onClose={() => setMenuOpen(null)} />
          <HeaderMenu label={t.company ?? "Company"} open={menuOpen === "company"} onOpen={() => setMenuOpen(menuOpen === "company" ? null : "company")} items={companyItems} onClose={() => setMenuOpen(null)} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <RegionControl />
          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={toggleTheme}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-secondary shadow-border transition-[box-shadow,color,scale] duration-150 ease-out hover:text-brand-text hover:shadow-border-hover active:scale-[0.96]"
          >
            <SunGlyph className={theme === "dark" ? "h-[18px] w-[18px] scale-100 opacity-100 blur-0 transition-[opacity,scale,filter] duration-150 ease-out" : "absolute h-[18px] w-[18px] scale-[0.25] opacity-0 blur-[4px] transition-[opacity,scale,filter] duration-150 ease-out"} />
            <MoonGlyph className={theme === "light" ? "h-[18px] w-[18px] scale-100 opacity-100 blur-0 transition-[opacity,scale,filter] duration-150 ease-out" : "absolute h-[18px] w-[18px] scale-[0.25] opacity-0 blur-[4px] transition-[opacity,scale,filter] duration-150 ease-out"} />
          </button>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="max-w-40 shrink-0 truncate whitespace-nowrap rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]"
            >
              {currentUser?.firstName ? `${currentUser.firstName}'s Portal` : "Trader Portal"}
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96]">
                {t.login ?? "Log in"}
              </Link>
              <Link href="/auth/register" className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
                {t.getStarted ?? "Get started"}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow-border transition-[box-shadow,scale] duration-150 hover:shadow-border-hover active:scale-[0.96] lg:hidden"
        >
          {open ? <CloseGlyph className="h-5 w-5" /> : <MenuGlyph className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-brand-background px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" onClick={() => setOpen(false)} className="rounded-brand border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white">Home</Link>
              <Link href="/trade" onClick={() => setOpen(false)} className="rounded-brand bg-brand-primary px-4 py-3 text-center text-sm font-semibold text-black">
                {t.trade ?? "Trade now"}
              </Link>
              {isAuthenticated && <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-brand border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white">
                {t.dashboard ?? "Dashboard"}
              </Link>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <RegionControl mobile />
            </div>
            {mobileSections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">{section.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-brand border border-white/10 px-4 py-3 text-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {!isAuthenticated && <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/auth/login" className="rounded-brand border border-white/10 px-4 py-3 text-center text-sm font-semibold">
                {t.login ?? "Log in"}
              </Link>
              <Link href="/auth/register" className="rounded-brand bg-brand-primary px-4 py-3 text-center text-sm font-semibold text-black">
                {t.getStarted ?? "Open account"}
              </Link>
            </div>}
          </nav>
        </div>
      ) : null}
      <div className="sr-only" aria-live="polite">{notice ?? (updatedAt ? formatFxTimestamp(updatedAt) : "Rates are loading")}</div>
    </header>
  );
}

function HeaderMenu({
  label,
  open,
  onOpen,
  onClose,
  items,
}: {
  label: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-secondary transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/5 hover:text-brand-text active:scale-[0.96]"
      >
        {label}
        <ActionArrowGlyph className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-90" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-12 w-64 -translate-x-1/2 rounded-[calc(var(--radius-brand)+14px)] border border-white/10 bg-brand-surface/95 p-2 shadow-border backdrop-blur-xl">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center justify-between rounded-brand px-3 py-3 text-sm text-brand-secondary transition-[background-color,color] duration-150 hover:bg-white/5 hover:text-brand-text">
              {item.label}
              <ActionArrowGlyph className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
