import type { BrandConfig } from "@/config/brand.schema";

export type NavItem = {
  label: string;
  href: string;
  feature?: keyof BrandConfig["features"];
};

const marketNavItems: NavItem[] = [
  { label: "Crypto", href: "/cryptocurrencies", feature: "cryptoTrading" },
  { label: "Forex", href: "/forex", feature: "forex" },
  { label: "Shares", href: "/shares", feature: "shares" },
  { label: "Indices", href: "/indices", feature: "indices" },
  { label: "ETFs", href: "/etfs", feature: "etfs" },
];

const productNavItems: NavItem[] = [
  { label: "Copy Trading", href: "/copy", feature: "copyTrading" },
  { label: "Automated Trading", href: "/automate", feature: "automatedTrading" },
  { label: "Education", href: "/for-traders", feature: "education" },
];

const baseNavItems: NavItem[] = [
  { label: "Trade", href: "/trade" },
  { label: "About", href: "/about" },
  { label: "Why Us", href: "/why-us" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contacts" },
];

const legalNavItems: NavItem[] = [
  { label: "Regulation", href: "/regulation" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

function enabled(items: NavItem[], brand: BrandConfig) {
  return items.filter((item) => !item.feature || brand.features[item.feature]);
}

export function getEnabledMarketNavItems(brand: BrandConfig) {
  return enabled(marketNavItems, brand);
}

export function getPrimaryNavItems(brand: BrandConfig) {
  return [...getEnabledMarketNavItems(brand), ...enabled(productNavItems, brand), ...baseNavItems];
}

export function getFooterNavItems(brand: BrandConfig) {
  return [...getPrimaryNavItems(brand), ...legalNavItems];
}

export function isFeatureEnabled(brand: BrandConfig, feature: keyof BrandConfig["features"]) {
  return brand.features[feature];
}

export function getSocialLinks(brand: BrandConfig) {
  return Object.entries(brand.social.links)
    .filter(([, url]) => Boolean(url))
    .map(([label, url]) => ({ label, url }));
}
