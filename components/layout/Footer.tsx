"use client";

import Link from "next/link";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getFooterNavItems, getSocialLinks } from "@/lib/features";
import { useTranslation } from "@/context/LanguageContext";

export function Footer() {
  const brand = getBrandConfig();
  const { t } = useTranslation();
  const footerItems = getFooterNavItems(brand);
  const socialLinks = getSocialLinks(brand);

  const exploreLinks = footerItems.filter((item) =>
    ["Staking", "Crypto", "Forex", "Shares", "Indices", "ETFs", "Copy Trading", "Automated Trading"].includes(item.label)
  );

  const companyLinks = [
    { href: "/about", label: t.about ?? "About us" },
    { href: "/why-us", label: t.whyUs ?? "Why choose us" },
    { href: "/faq", label: t.faq ?? "Help Center" },
    { href: "/contacts", label: t.contact ?? "Contact" },
    { href: "/regulation", label: t.regulation ?? "Regulation" },
  ];

  const legalLinks = [
    { href: "/terms", label: t.terms ?? "Terms & Conditions" },
    { href: "/privacy", label: t.privacy ?? "Privacy Policy" },
  ];

  const riskWarning =
    brand.legal.riskWarningText ||
    "RISK WARNING: The risk of loss in online trading of stocks, options, futures, currencies, foreign equities, and fixed income can be substantial. Trading on margin carries a high level of risk since leverage can work both to your advantage and disadvantage, and is only for experienced investors with high risk tolerance. You may lose more than your initial investment. Never invest money you cannot afford to lose. Before trading, please ensure you understand the risks involved.";

  return (
    <footer className="border-t border-white/10 bg-brand-surface/50">
      {/* Main footer grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        {/* Brand column */}
        <div>
          <p className="font-heading text-2xl font-semibold tracking-tight">
            {brand.brand.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-brand-secondary">
            {t.footerTagline ?? "Your trusted partner for multi-asset trading across crypto, stocks, forex and commodities. Serving 150,000+ traders in 180+ countries."}
          </p>

          {/* Contact details */}
          <div className="mt-6 space-y-1.5 text-sm text-brand-secondary">
            {brand.brand.supportEmail && (
              <p>
                <a
                  href={`mailto:${brand.brand.supportEmail}`}
                  className="transition-colors duration-150 hover:text-brand-text"
                >
                  {brand.brand.supportEmail}
                </a>
              </p>
            )}
            {brand.brand.supportPhone && (
              <p>
                <a
                  href={`tel:${brand.brand.supportPhone}`}
                  className="transition-colors duration-150 hover:text-brand-text"
                >
                  {brand.brand.supportPhone}
                </a>
              </p>
            )}
            {brand.brand.address && (
              <p>{brand.brand.address}</p>
            )}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-secondary transition-colors duration-150 hover:text-brand-text"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Explore column */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-text">
            {t.footerExplore ?? "Explore"}
          </h2>
          <nav aria-label="Explore navigation" className="mt-4 grid gap-2.5 text-sm text-brand-secondary">
            <Link href="/cryptocurrencies" className="transition-colors duration-150 hover:text-brand-text">{t.footerCrypto ?? "Crypto"}</Link>
            <Link href="/forex" className="transition-colors duration-150 hover:text-brand-text">{t.footerForex ?? "Forex"}</Link>
            <Link href="/shares" className="transition-colors duration-150 hover:text-brand-text">{t.footerStocks ?? "Stocks"}</Link>
            <Link href="/indices" className="transition-colors duration-150 hover:text-brand-text">{t.footerIndices ?? "Indices"}</Link>
            <Link href="/etfs" className="transition-colors duration-150 hover:text-brand-text">{t.footerETFs ?? "ETFs"}</Link>
            <Link href="/trade" className="transition-colors duration-150 hover:text-brand-text">{t.footerLiveTrading ?? "Live trading"}</Link>
            {exploreLinks.some((i) => i.label === "Copy Trading") && (
              <Link href="/copy" className="transition-colors duration-150 hover:text-brand-text">{t.footerCopyTrading ?? "Copy trading"}</Link>
            )}
            <Link href="/cryptocurrencies" className="transition-colors duration-150 hover:text-brand-text">{t.footerStaking ?? "Staking"}</Link>
          </nav>
        </div>

        {/* Company column */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-text">
            {t.footerCompany ?? "Company"}
          </h2>
          <nav aria-label="Company navigation" className="mt-4 grid gap-2.5 text-sm text-brand-secondary">
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-150 hover:text-brand-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Account column */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-text">
            {t.footerAccount ?? "Account"}
          </h2>
          <nav aria-label="Account navigation" className="mt-4 grid gap-2.5 text-sm text-brand-secondary">
            <Link href="/auth/login" className="transition-colors duration-150 hover:text-brand-text">
              {t.footerLogin ?? "Log in"}
            </Link>
            <Link href="/auth/register" className="transition-colors duration-150 hover:text-brand-text">
              {t.footerCreateAccount ?? "Create account"}
            </Link>
            <Link href="/dashboard" className="transition-colors duration-150 hover:text-brand-text">
              {t.footerDashboard ?? "Dashboard"}
            </Link>
            <Link href="/contacts" className="transition-colors duration-150 hover:text-brand-text">
              {t.footerSupport ?? "Support"}
            </Link>
          </nav>
        </div>
      </div>

      {/* Risk warning */}
      <div className="border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] leading-5 text-brand-secondary/70">
            {riskWarning}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-brand-secondary">
            © {new Date().getFullYear()}{" "}
            {brand.brand.legalEntityName || brand.brand.name}. {t.allRightsReserved ?? "All rights reserved."}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-brand-secondary">
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="transition-colors duration-150 hover:text-brand-text">Rates By Exchange Rate API</a>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-150 hover:text-brand-text"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
