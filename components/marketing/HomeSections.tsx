"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Check,
  Copy,
  Landmark,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentType, type RefObject, type SVGProps } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { HeroAssetPanel } from "@/components/block/HeroAssetPanel";
import { LabelInput } from "@/components/block/LabelInput";
import { LiquidToggle } from "@/components/block/LiquidToggle";
import { PullToRefresh } from "@/components/block/PullToRefresh";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { LiveTicker } from "@/components/markets/LiveTicker";
import { LinkButton } from "@/components/ui/Button";
import { ScrollReveal, SmoothCounter, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Section } from "@/components/ui/Section";
import type { BrandConfig } from "@/config/brand.schema";
import type { MarketPoint, MarketQuote } from "@/lib/market-data/types";
import { useTranslation } from "@/context/LanguageContext";

type HomeSectionsProps = {
  brand: BrandConfig;
  quotes: MarketQuote[];
  histories: Record<string, MarketPoint[]>;
};

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
  detail: string;
  image: string;
  imageAlt: string;
};



const testimonials = [
  {
    rating: 5,
    text: "Incredible company. I've been trading with them for months, had two fast withdrawals and a fee refund in under 48 hours. I absolutely recommend this firm.",
    initials: "LV",
    name: "Louis van Nuekerk",
    role: "Verified Trader",
  },
  {
    rating: 5,
    text: "An amazing platform that gives you real opportunity to achieve your goals and become a successful trader with outstanding financial tools and support.",
    initials: "AD",
    name: "Adam D.",
    role: "Forex Trader",
  },
  {
    rating: 5,
    text: "Great company, no issues with payouts, excellent customer support. Highly recommended for both beginner and experienced traders worldwide.",
    initials: "JS",
    name: "Jakub Szulc",
    role: "Equity Trader",
  },
  {
    rating: 5,
    text: "Legitimate and transparent. Nothing out there can compare to this level of service and platform reliability. Thank you for the opportunity.",
    initials: "DE",
    name: "Dee",
    role: "Crypto Trader",
  },
  {
    rating: 5,
    text: "This platform has everything you could ask for. I'm super happy it was recommended to me as my very first broker. The experience has been flawless.",
    initials: "AV",
    name: "Agata Vincent",
    role: "Portfolio Manager",
  },
  {
    rating: 5,
    text: "Amazing execution speed — one of the best across the entire market. I genuinely recommend this platform to anyone serious about trading.",
    initials: "PK",
    name: "Pro Kittisak",
    role: "Day Trader",
  },
];

const membershipPlans = [
  {
    badge: "STANDARD",
    name: "Standard",
    price: "$0",
    description: "A simple, capable place to begin your trading journey.",
    benefits: ["Live trading wallet", "Market tools and insights", "Standard support"],
    featured: false,
  },
  {
    badge: "MOST POPULAR",
    name: "Pro Trader",
    price: "$1,500",
    description: "More room to grow, with sharper benefits for active traders.",
    benefits: ["30% trading-fee discount", "3.5% staking APY bonus", "Priority support"],
    featured: true,
  },
  {
    badge: "VIP",
    name: "VIP Institutional",
    price: "$5,000",
    description: "Dedicated support and the strongest benefits for serious investors.",
    benefits: ["60% trading-fee discount", "8% staking APY bonus", "Personal account manager"],
    featured: false,
  },
] as const;

export function HomeSections({ brand, quotes }: HomeSectionsProps) {
  const { t } = useTranslation();
  const featureStackRef = useRef<HTMLDivElement>(null);

  const marketMetrics = [
    { label: t.activeInstruments ?? "Active instruments", value: "50+", sub: t.instrumentsSub ?? "Across all asset classes" },
    { label: t.avgExecutionSpeed ?? "Avg. execution speed", value: "<7.8ms", sub: t.speedSub ?? "Ultra-low latency fills" },
    { label: t.uptimeGuarantee ?? "Uptime guarantee", value: "99.98%", sub: t.uptimeSub ?? "Mission-critical reliability" },
    { label: t.marketsSupported ?? "Markets supported", value: "180+", sub: t.marketsSub ?? "Countries with live access" },
  ];

  const features: Feature[] = [
    {
      icon: Copy,
      title: t.feat1Title ?? "One-click copy trading",
      body: t.feat1Body ?? "Copy the trades of experienced, verified strategy providers with a single click and mirror winning strategies automatically.",
      detail: "Our copy-trading engine lets you browse a ranked list of verified strategy providers, review their historical performance, risk profile, and drawdown stats — then subscribe with one click. Your account mirrors every trade in real time, proportional to your balance. Pause or stop at any moment with zero fees.",
      image: "/brands/default/feat-copy.svg",
      imageAlt: "Copy trading dashboard",
    },
    {
      icon: TrendingUp,
      title: t.feat2Title ?? "Up to 100x leverage",
      body: t.feat2Body ?? "Maximize your trading potential with up to 100x leverage on major crypto and forex pairs globally.",
      detail: "Select your leverage multiplier per position — from 2x to 100x on major crypto and forex pairs. Built-in risk guard caps exposure automatically when margin approaches the threshold. Fine-tune position size, set stop-loss and take-profit levels in the same view, all in under 10 seconds.",
      image: "/brands/default/feat-leverage.svg",
      imageAlt: "Leverage and risk management controls",
    },
    {
      icon: Zap,
      title: t.feat3Title ?? "Real-time execution",
      body: t.feat3Body ?? "Experience seamless order execution with sub-millisecond fills and tight spreads across all 50+ instruments.",
      detail: "Orders route through our proprietary low-latency engine with average fill times under 8ms. No last-look delays. No requotes. Tight spreads from 0.0 pips on major pairs. Slippage protection is active by default and can be customised per instrument from your account settings.",
      image: "/brands/default/feat-execution.svg",
      imageAlt: "Real-time execution speed chart",
    },
    {
      icon: Sparkles,
      title: t.feat4Title ?? "Demo accounts",
      body: t.feat4Body ?? "Test your strategies risk-free with a fully-featured demo account before committing real funds.",
      detail: "Demo accounts come preloaded with $100,000 in virtual funds and access every feature of the live platform — including copy trading, leverage controls, order types, and market data feeds. Switch between demo and live at any time from the account mode toggle. No credit card required.",
      image: "/brands/default/feat-demo.svg",
      imageAlt: "Demo account simulation interface",
    },
    {
      icon: Users,
      title: t.feat5Title ?? "Portfolio management",
      body: t.feat5Body ?? "Track all assets across every market in one unified view. Manage, rebalance, and monitor with ease.",
      detail: "Consolidate every position — crypto, stocks, forex, indices, and commodities — into a single portfolio dashboard. View unrealised P&L, allocation percentage, and historical performance side by side. Export reports in PDF or CSV, or connect to third-party analytics tools via our open API.",
      image: "/brands/default/feat-portfolio.svg",
      imageAlt: "Portfolio management dashboard",
    },
    {
      icon: BellRing,
      title: t.feat6Title ?? "24/7 live-chat support",
      body: t.feat6Body ?? "World-class support available around the clock. Average response time under 3 minutes — no bots.",
      detail: "Our multilingual support team is available 24 hours a day, 7 days a week via live chat, email, and phone. Average first-response time is under 3 minutes. Every agent is a trained market professional — no scripts, no bots. VIP clients receive a dedicated account manager.",
      image: "/brands/default/feat-support.svg",
      imageAlt: "24/7 live support chat interface",
    },
  ];

  const whyUs = [
    {
      icon: ShieldCheck,
      title: t.why1Title ?? "Unified asset management",
      body: t.why1Body ?? "Manage multiple asset classes and accounts from a single, beautifully designed interface — no tab-switching, no friction.",
    },
    {
      icon: Landmark,
      title: t.why2Title ?? "Global market access",
      body: t.why2Body ?? "Trade crypto, stocks, forex, and commodities in one account. 50+ markets. One login. Full control.",
    },
    {
      icon: ArrowDownUp,
      title: t.why3Title ?? "Fast deposits & withdrawals",
      body: t.why3Body ?? "Move funds in and out quickly with all major payment methods supported. Most withdrawals processed within 24–48 hours.",
    },
    {
      icon: Lock,
      title: t.why4Title ?? "Bank-grade security",
      body: t.why4Body ?? "256-bit AES encryption, 2FA, and 95% of user funds held in air-gapped cold wallets away from any network.",
    },
  ];

  const productCards = [
    {
      label: t.assetCrypto ?? "Crypto",
      kind: "crypto",
      href: "/cryptocurrencies",
      enabled: brand.features.cryptoTrading,
      body: t.assetCryptoBody ?? "Spot active digital-asset moves. Bitcoin, Ethereum, Solana, and 20+ more with live price feeds.",
    },
    {
      label: t.assetForex ?? "Forex",
      kind: "forex",
      href: "/forex",
      enabled: brand.features.forex,
      body: t.assetForexBody ?? "Major and minor currency pairs with tight spreads, real-time data, and fast order execution.",
    },
    {
      label: t.assetStocks ?? "Stocks",
      kind: "stocks",
      href: "/shares",
      enabled: brand.features.shares,
      body: t.assetStocksBody ?? "Trade blue-chip equities alongside every other asset class from a single unified account.",
    },
    {
      label: t.assetIndices ?? "Indices",
      kind: "indices",
      href: "/indices",
      enabled: brand.features.indices,
      body: t.assetIndicesBody ?? "Track broader market direction. S&P 500, NASDAQ, FTSE, DAX and more in one place.",
    },
    {
      label: t.assetCommodities ?? "Commodities",
      kind: "commodities",
      href: "/markets",
      enabled: true,
      body: t.assetCommoditiesBody ?? "Gold, silver, crude oil, natural gas, and agricultural products — all accessible in one account.",
    },
  ].filter((item) => item.enabled);

  const stakingRows = [
    { name: "Bitcoin", symbol: "BTC", apy: "4.5%", min: "0.001 BTC", period: t.stakingFlexible ?? "Flexible" },
    { name: "Ethereum", symbol: "ETH", apy: "5.8%", min: "0.05 ETH", period: t.stakingFlexible ?? "Flexible" },
    { name: "Solana", symbol: "SOL", apy: "7.2%", min: "1 SOL", period: "30 days" },
    { name: "Tether", symbol: "USDT", apy: "9.0%", min: "100 USDT", period: "90 days" },
  ];

  return (
    <main id="main-content">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading" className="hero-stage relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image src="/images/hero-curtain-glow.png" alt="" fill priority sizes="100vw" className="pointer-events-none select-none object-cover object-center" />
          {/* Side overlays for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/35" />
        </div>
        {/* Top fade — kept semi-transparent so the beam lights show */}
        <div className="absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-brand-background/90 via-brand-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-brand-background via-brand-background/80 to-transparent" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="space-y-6">
            <ScrollReveal delay={0.1} className="w-fit"><p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
              {t.heroBadge ?? brand.brand.tagline}
            </p></ScrollReveal>
            {/* text-wrap:balance */}
            <ScrollReveal delay={0.2}><h1
              id="hero-heading"
              className="max-w-4xl font-heading text-5xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {t.heroHeadline ?? brand.content.hero.headline}
            </h1></ScrollReveal>
            <ScrollReveal delay={0.3}><p className="max-w-xl text-base leading-relaxed text-brand-secondary/90 sm:text-lg" style={{ textWrap: "pretty" } as React.CSSProperties}>
              {t.heroSubheadline ?? brand.content.hero.subheadline}
            </p></ScrollReveal>
            <ScrollReveal delay={0.35}><div className="flex flex-wrap gap-3.5 pt-2">
              <LinkButton href="/auth/register" className="shadow-[0_0_25px_-4px_rgba(0,231,88,0.5)]">{t.heroPrimary ?? brand.content.hero.primaryCta}</LinkButton>
              <LinkButton href="/auth/login" variant="secondary" className="border-white/15 bg-white/5 backdrop-blur-xl hover:bg-white/10">{t.heroSecondary ?? brand.content.hero.secondaryCta}</LinkButton>
            </div></ScrollReveal>

            {/* Stats */}
            <StaggerContainer staggerDelay={0.08} delayChildren={0.35} className="grid max-w-xl grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
              {[
                { value: 150, suffix: "K+", label: t.statTraders ?? "Active traders" },
                { value: 2.4, prefix: "$", suffix: "B", decimals: 1, label: t.statVolume ?? "Monthly volume" },
                { value: 99.98, suffix: "%", decimals: 2, label: t.statUptime ?? "Platform uptime" },
                { value: 50, suffix: "+", label: t.statMarkets ?? "Global markets" },
              ].map((stat) => (
                <StaggerItem key={stat.label} className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
                  <p className="font-mono text-xl font-bold text-white"><SmoothCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} /></p>
                  <p className="text-[11px] font-medium text-brand-secondary">{stat.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <ScrollReveal direction="left" delay={0.25} className="relative"><HeroAssetPanel quotes={quotes} currency={brand.currencyDefault} /></ScrollReveal>
        </div>
      </section>

      {/* ── Live ticker ───────────────────────────────────────────────────── */}
      <LiveTicker quotes={quotes} currency={brand.currencyDefault} />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.featuresEyebrow ?? "Features"}
        title={t.featuresTitle ?? "All the features you need for profits"}
        body={t.featuresBody ?? "Everything a modern trader needs — built into one seamless, powerful platform."}
      >
        <FeatureStack features={features} stackRef={featureStackRef} />
      </Section>

      {/* ── Why us ───────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.whyUsEyebrow ?? "Why choose us"}
        title={t.whyUsTitle ?? "Everything you need to trade, in one place"}
        body={t.whyUsBody ?? "Manage assets, place trades, track progress, and move funds seamlessly across markets, accounts, and devices."}
      >
        <div className="bg-dot-matrix rounded-[calc(var(--radius-brand)+16px)] p-3"><WhyUsCards items={whyUs} /></div>
      </Section>

      {/* ── Markets ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.marketsEyebrow ?? "Markets"}
        title={t.marketsTitle ?? "See what is moving before you decide"}
        body={t.marketsBody ?? "Real-time prices, daily movement, and market context across crypto, forex, stocks, and commodities."}
      >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
          {/* Professional market metrics sidebar */}
          <MarketMetrics metrics={marketMetrics} />
          <div className="min-w-0">
            <PullToRefresh>
              <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={6} />
            </PullToRefresh>
          </div>
        </div>
      </Section>

      {/* ── Supported assets ─────────────────────────────────────────────── */}
      <Section
        eyebrow={t.assetsEyebrow ?? "Supported assets"}
        title={t.assetsTitle ?? "Trade the world's biggest assets"}
        body={t.assetsBody ?? "From Bitcoin to blue-chip stocks — access 50+ markets from one account."}
      >
        <AssetsBento items={productCards} />
      </Section>

      {/* ── Staking ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.stakingEyebrow ?? "Earn while you hold"}
        title={t.stakingTitle ?? "Staking — put your crypto to work"}
        body={t.stakingBody ?? "Stake your assets and earn passive rewards daily with no lock-in commitment on flexible plans."}
      >
        <div className="relative"><div className="pointer-events-none absolute left-1/2 -top-24 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[100px]" /><div className="bg-dot-matrix overflow-hidden rounded-[calc(var(--radius-brand)+12px)] border border-white/10 bg-brand-surface shadow-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-brand-secondary">
                <th className="px-5 py-4 text-left font-semibold">{t.stakingAsset ?? "Asset"}</th>
                <th className="px-5 py-4 text-left font-semibold tabular-nums">{t.stakingApy ?? "APY"}</th>
                <th className="hidden px-5 py-4 text-left font-semibold sm:table-cell">{t.stakingMin ?? "Min. stake"}</th>
                <th className="hidden px-5 py-4 text-left font-semibold md:table-cell">{t.stakingPeriod ?? "Lock period"}</th>
              </tr>
            </thead>
            <tbody>
              {stakingRows.map((row, i) => (
                <tr
                  key={row.symbol}
                  className={`transition-colors duration-100 hover:bg-white/[0.03] ${i < stakingRows.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span className="font-medium">{row.name}</span>{" "}
                    <span className="text-brand-secondary">{row.symbol}</span>
                  </td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-brand-primary">{row.apy}</td>
                  <td className="hidden px-5 py-4 tabular-nums text-brand-secondary sm:table-cell">{row.min}</td>
                  <td className="hidden px-5 py-4 text-brand-secondary md:table-cell">{row.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/10 px-5 py-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-[opacity] duration-150 hover:opacity-80"
            >
              {t.stakingStartLink ?? "Start earning now"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div></div>
      </Section>

      {/* ── Trading tools ────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.toolsEyebrow ?? "Trading tools"}
        title={t.toolsTitle ?? "Tools that move at market speed"}
        body={t.toolsBody ?? "Switch between practice and live modes, set a risk preference, and subscribe to market updates without leaving the page you are using."}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Mode toggle */}
          <div className="why-us-card why-us-card--tool p-6">
            <CircuitTraces variant={1} />
            <div className="relative z-10">
            <Zap className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool1Title ?? "Account mode"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool1Body ?? "Switch between demo and live trading instantly. Practice strategies before committing real capital — no risk, full experience."}
            </p>
            <div className="mt-6 space-y-4">
              <LiquidToggle label={t.tool1Title ?? "Account mode"} checkedLabel={t.tool1Live ?? "Live"} uncheckedLabel={t.tool1Demo ?? "Demo"} />
              <LiquidToggle label={t.tool1RiskGuard ?? "Risk guard"} checkedLabel={t.tool1On ?? "On"} uncheckedLabel={t.tool1Off ?? "Off"} defaultChecked />
            </div>
            </div>
          </div>

          {/* Leverage card */}
          <div className="trading-tool-card trading-tool-card--desk p-6">
            <CircuitTraces variant={2} />
            <div className="relative z-10">
            <TrendingUp className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool2Title ?? "Up to 100x leverage"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool2Body ?? "Fine-tune your exposure with responsive controls and clear risk boundaries. Scale positions with confidence on major crypto and forex pairs."}
            </p>
            <Link
              href="/trade"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-[opacity] duration-150 hover:opacity-80"
            >
              {t.tool2Link ?? "Open trade desk"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            </div>
          </div>

          {/* Alerts card */}
          <div className="why-us-card why-us-card--tool p-6">
            <CircuitTraces variant={3} />
            <div className="relative z-10">
            <BellRing className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool3Title ?? "Smart alerts"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool3Body ?? "Receive market updates at the frequency you choose. Change or cancel alerts from your account settings at any time."}
            </p>
            <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <LabelInput label={t.tool3EmailPlaceholder ?? "Email"} type="email" name="email" />
              <button
                type="submit"
                className="w-full rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
              >
                {t.tool3Button ?? "Notify me"}
              </button>
            </form>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Who we are ───────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.whoEyebrow ?? "Who we are"}
        title={t.whoTitle ?? "Built by traders, for traders"}
        body={t.whoBody ?? "Founded with a single mission: give every person on the planet access to the world's financial markets. A multi-asset brokerage serving clients across 180+ countries with transparent pricing and award-winning support."}
      >
        <div className="who-stats-banner">
          {[
            { value: "2018", label: t.statFounded ?? "Founded" },
            { value: "150K+", label: t.statActiveTraders ?? "Active traders" },
            { value: "180+", label: t.statCountries ?? "Countries served" },
          ].map((stat) => (
            <div key={stat.label} className="who-stat-item">
              <p className="who-stat-value">{stat.value}</p>
              <p className="who-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Membership plans ─────────────────────────────────────────────── */}
      <Section
        eyebrow="Membership"
        title="Choose the plan that matches your ambition"
        body="Start free, then unlock more rewards, lower fees, and dedicated support as your trading grows."
      >
        <MembershipWheel />
      </Section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.testimonialsEyebrow ?? "Testimonials"}
        title={t.testimonialsTitle ?? "Traders and investors love us"}
        body={t.testimonialsBody ?? "Discover what 150,000+ traders from 180+ countries are saying about their experience."}
      >
        <TestimonialsMarquee />
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-[calc(var(--radius-brand)+16px)] bg-brand-primary p-8 text-black sm:p-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <h2
                id="cta-heading"
                className="font-heading text-3xl font-semibold sm:text-4xl"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {t.ctaTitle ?? "Start trading with confidence today"}
              </h2>
              <p className="mt-4 max-w-2xl text-black/70" style={{ textWrap: "pretty" } as React.CSSProperties}>
                {t.ctaBody ?? "Join over 150,000 traders already on the platform. Create your free account in under two minutes."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-brand bg-black px-5 py-3 text-sm font-semibold text-white transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
              >
                {t.ctaPrimary ?? "Create free account"}
              </Link>
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center rounded-brand bg-black/10 px-5 py-3 text-sm font-semibold text-black transition-[opacity,transform,background-color] duration-150 hover:bg-black/15 active:scale-[0.96]"
              >
                {t.ctaSecondary ?? "Talk to support"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MembershipWheel() {
  const [active, setActive] = useState(1);
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const total = membershipPlans.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => setStageWidth(stage.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const go = useCallback((direction: 1 | -1) => {
    setActive((current) => (current + direction + total) % total);
  }, [total]);

  const handleKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
  }, [go]);

  return (
    <div
      className="membership-wheel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Membership plans"
      tabIndex={0}
      onKeyDown={handleKey}
    >
      <div className="membership-wheel-dots" role="tablist" aria-label="Select membership plan">
        {membershipPlans.map((plan, index) => (
          <button
            key={plan.name}
            className="membership-wheel-dot"
            role="tab"
            aria-current={index === active ? "true" : undefined}
            aria-label={`Show ${plan.name} plan`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>

      <div ref={stageRef} className="membership-wheel-stage">
        <div className="membership-wheel-track">
          {membershipPlans.map((plan, index) => {
            const offset = ((index - active + total + 1) % total) - 1;
            const isActive = offset === 0;
            const mobile = stageWidth > 0 && stageWidth < 768;
            const stepX = mobile ? Math.min(stageWidth * 0.82, 300) : 340;
            const cardProps = {
              x: offset * stepX,
              y: Math.abs(offset) * (mobile ? 18 : 28),
              rotate: offset * 5,
              scale: isActive ? 1 : mobile ? 0.88 : 0.93,
              opacity: isActive ? 1 : mobile ? 0.42 : 0.72,
            };

            return (
              <motion.article
                key={plan.name}
                className="membership-wheel-card"
                data-active={isActive ? "true" : undefined}
                data-featured={plan.featured ? "true" : undefined}
                animate={reducedMotion ? { opacity: cardProps.opacity } : cardProps}
                transition={{ type: "spring", stiffness: 190, damping: 25 }}
                style={{ zIndex: isActive ? 10 : 5 }}
                onClick={() => !isActive && setActive(index)}
              >
                <div className="membership-wheel-card__shine" aria-hidden="true" />
                <div className="membership-wheel-card__topline">
                  <span className="membership-wheel-card__badge">{plan.badge}</span>
                  {plan.featured ? <span className="membership-wheel-card__signal">Best value</span> : null}
                </div>
                <h3 className="membership-wheel-card__name">{plan.name}</h3>
                <p className="membership-wheel-card__description">{plan.description}</p>
                <p className="membership-wheel-card__price"><span>{plan.price}</span><small> / plan</small></p>
                <ul className="membership-wheel-card__benefits">
                  {plan.benefits.map((benefit) => <li key={benefit}><Check size={15} aria-hidden="true" />{benefit}</li>)}
                </ul>
                <Link
                  href="/auth/register"
                  tabIndex={isActive ? 0 : -1}
                  className="membership-wheel-card__cta"
                >
                  {plan.price === "$0" ? "Get started" : "Explore plan"}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>

      <div className="membership-wheel-controls">
        <button className="membership-wheel-btn membership-wheel-btn--prev" aria-label="Previous membership plan" onClick={() => go(-1)}><ArrowLeft size={18} /></button>
        <button className="membership-wheel-btn membership-wheel-btn--next" aria-label="Next membership plan" onClick={() => go(1)}><ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

function FeatureStack({ features, stackRef }: { features: Feature[]; stackRef: RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  const scrollLength = `${features.length * 100}vh`;

  return <div className="relative"><div className="pointer-events-none absolute left-1/2 -top-24 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[100px]" />
    <div ref={stackRef} className="relative hidden md:block" style={{ height: scrollLength }}>
      <div className="sticky top-[18vh] h-[min(64vh,620px)] min-h-[430px] overflow-hidden rounded-[calc(var(--radius-brand)+16px)] bg-dot-matrix p-3">
        {features.map((feature, index) => <ScrollFeatureCard key={feature.title} feature={feature} index={index} total={features.length} progress={scrollYProgress} />)}
      </div>
    </div>
    <div className="feature-mobile-stack md:hidden">
      {features.map((feature, index) => <MobileStackFeatureCard key={feature.title} feature={feature} index={index} />)}
    </div>
  </div>;
}

function MobileStackFeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (reducedMotion || index === 0) return;
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setCovered(!entry.isIntersecting), { threshold: 0, rootMargin: "-72px 0px 0px 0px" });
    observer.observe(card);
    return () => observer.disconnect();
  }, [index, reducedMotion]);

  return <div ref={cardRef} className="feature-mobile-stack-item" data-covered={covered ? "true" : undefined} style={{ "--stack-index": index, "--stack-offset": `${index * 0.7}rem` } as React.CSSProperties}><ExpandedFeatureCard feature={feature} className="feature-mobile-stack-card" /></div>;
}

type MarketMetric = { label: string; value: string; sub: string };

function MarketMetrics({ metrics }: { metrics: MarketMetric[] }) {
  return <>
    <div className="hidden flex-col gap-3 md:flex">{metrics.map((metric) => <MarketMetricCard key={metric.label} metric={metric} />)}</div>
    <div className="market-metrics-marquee md:hidden" tabIndex={0} aria-label="Market statistics"><div className="market-metrics-marquee-track"><MarketMetricSet metrics={metrics} /> <div aria-hidden="true"><MarketMetricSet metrics={metrics} /></div></div></div>
  </>;
}

function MarketMetricSet({ metrics }: { metrics: MarketMetric[] }) { return <div className="market-metrics-marquee-set">{metrics.map((metric) => <MarketMetricCard key={metric.label} metric={metric} />)}</div>; }
function MarketMetricCard({ metric }: { metric: MarketMetric }) { return <div className="mkt-metric-card"><p className="mkt-metric-value">{metric.value}</p><p className="mkt-metric-label">{metric.label}</p><p className="mkt-metric-sub">{metric.sub}</p></div>; }

function ScrollFeatureCard({ feature, index, total, progress }: { feature: Feature; index: number; total: number; progress: MotionValue<number> }) {
  const range = index === 0 ? [0, 1] : [(index - 1) / total, index / total];
  const y = useTransform(progress, range, index === 0 ? ["0%", "0%"] : ["100%", "0%"]);
  return <motion.div className="absolute inset-3" style={{ y, zIndex: index + 1 }}><ExpandedFeatureCard feature={feature} className="h-full" /></motion.div>;
}

function ExpandedFeatureCard({ feature, className = "" }: { feature: Feature; className?: string }) {
  const Icon = feature.icon;
  return <article className={`grid overflow-hidden rounded-[calc(var(--radius-brand)+12px)] border border-white/10 bg-brand-surface p-6 shadow-border md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-9 ${className}`}>
    <div className="flex flex-col justify-center"><Icon className="h-8 w-8 text-brand-primary" /><h3 className="mt-5 font-heading text-2xl font-semibold text-white">{feature.title}</h3><p className="mt-4 max-w-xl text-sm leading-7 text-brand-secondary">{feature.detail}</p><Link href="/auth/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-opacity hover:opacity-80">Get started <ArrowUpRight className="h-4 w-4" /></Link></div>
    <div className="mt-6 flex min-h-[200px] items-center justify-center md:mt-0"><img src={feature.image} alt={feature.imageAlt} loading="lazy" className="max-h-[300px] w-full rounded-[calc(var(--radius-brand)+4px)] object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)]" /></div>
  </article>;
}

type WhyUsItem = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; body: string };

function WhyUsCards({ items }: { items: WhyUsItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(reducedMotion ?? false);

  useEffect(() => {
    if (reducedMotion) {
      setStarted(true);
      return;
    }

    const grid = gridRef.current;
    if (!grid) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -15% 0px" });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {items.map((item, index) => <WhyUsCard key={item.title} item={item} step={index + 1} started={started} />)}
  </div>;
}

function WhyUsCard({ item, step, started }: { item: WhyUsItem; step: number; started: boolean }) {
  const Icon = item.icon;
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const glow = [34, 30, 27, 24][step - 1] ?? 24;
  const pocketClass = revealed || reducedMotion ? "why-us-pocket why-us-pocket--open" : started ? "why-us-pocket why-us-pocket--animating" : "why-us-pocket";

  return <motion.div
    className={pocketClass}
    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%", scale: 0.96, rotateX: 1.5 }}
    animate={started ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : undefined}
    transition={{ duration: reducedMotion ? 0.25 : 0.6, delay: reducedMotion ? 0 : (step - 1) * 0.12, ease: [0.22, 1, 0.36, 1] }}
    style={{ transformPerspective: 1000 }}
    onAnimationComplete={() => setRevealed(true)}
  >
    <article className="why-us-card" style={{ "--why-us-glow": `${glow}%` } as React.CSSProperties}>
      <CircuitTraces variant={step} />
      <span className={`why-us-card-number${step === 1 ? " why-us-card-number--narrow" : step === 2 ? " why-us-card-number--two" : ""}`} aria-hidden="true">{step}</span>
      <div className="why-us-card-content">
        <span className="why-us-card-icon"><Icon className="h-7 w-7" /></span>
        <h3 className="mt-5 font-heading text-base font-semibold" style={{ textWrap: "balance" } as React.CSSProperties}>{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-secondary">{item.body}</p>
      </div>
    </article>
  </motion.div>;
}

function CircuitTraces({ variant }: { variant: number }) {
  const shared = { stroke: "var(--accent)", strokeWidth: 1, fill: "none" };
  const terminal = { fill: "var(--accent)" };

  if (variant === 1) return <svg className="why-us-traces" viewBox="0 0 400 320" aria-hidden="true"><g {...shared}><path d="M-8 68H98V116H188V178H308" /><path d="M116-8V54H246V106H410" /><path d="M28 276H146V230H258V190" /></g><g {...terminal}><circle cx="98" cy="68" r="3" /><circle cx="188" cy="116" r="3" /><circle cx="308" cy="178" r="3" /><circle cx="246" cy="54" r="3" /></g></svg>;
  if (variant === 2) return <svg className="why-us-traces" viewBox="0 0 400 320" aria-hidden="true"><g {...shared}><path d="M-8 112H76V70H168V128H286V72H410" /><path d="M42 328V238H120V184H214" /><path d="M196-8V36H320V148" /></g><g {...terminal}><circle cx="76" cy="112" r="3" /><circle cx="168" cy="70" r="3" /><circle cx="286" cy="128" r="3" /><circle cx="120" cy="238" r="3" /></g></svg>;
  if (variant === 3) return <svg className="why-us-traces" viewBox="0 0 400 320" aria-hidden="true"><g {...shared}><path d="M-8 86H80V142H156V94H270V52H410" /><path d="M92-8V52H220V156H334V222" /><path d="M-8 264H104V216H192V270H286" /></g><g {...terminal}><circle cx="80" cy="86" r="3" /><circle cx="156" cy="142" r="3" /><circle cx="270" cy="94" r="3" /><circle cx="220" cy="52" r="3" /></g></svg>;
  return <svg className="why-us-traces" viewBox="0 0 400 320" aria-hidden="true"><g {...shared}><path d="M-8 58H108V108H202V62H326V118H410" /><path d="M36 328V238H150V188H236V236H352" /><path d="M248-8V36H296V84" /></g><g {...terminal}><circle cx="108" cy="58" r="3" /><circle cx="202" cy="108" r="3" /><circle cx="326" cy="62" r="3" /><circle cx="150" cy="238" r="3" /></g></svg>;
}

type AssetBentoItem = { label: string; href: string; body: string; kind: string };

function AssetsBento({ items }: { items: AssetBentoItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(reducedMotion ?? false);

  useEffect(() => {
    if (reducedMotion) { setStarted(true); return; }
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0, rootMargin: "0px 0px -15% 0px" });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return <div ref={gridRef} className="asset-bento-grid">
    {items.map((item, index) => <AssetBentoCard key={item.href} item={item} index={index} started={started} />)}
  </div>;
}

function AssetBentoCard({ item, index, started }: { item: AssetBentoItem; index: number; started: boolean }) {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const pocketClass = revealed || reducedMotion
    ? "asset-bento-pocket asset-bento-pocket--open"
    : started ? "asset-bento-pocket asset-bento-pocket--animating" : "asset-bento-pocket";

  return (
    <motion.div
      className={pocketClass}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%", scale: 0.96 }}
      animate={started ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: reducedMotion ? 0.25 : 0.6, delay: reducedMotion ? 0 : index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => setRevealed(true)}
    >
      <Link href={item.href} className={`asset-bento-card asset-bento-card--${item.kind}`}>
        {/* Text zone — always on top, never clipped */}
        <div className="asset-bento-copy">
          <ArrowUpRight className="asset-bento-arrow" />
          <h3 className="font-heading text-xl font-semibold">{item.label}</h3>
          <p className="mt-2 text-sm leading-6 text-brand-secondary">{item.body}</p>
        </div>
        {/* Visual zone — reserved space below/beside text */}
        <AssetBentoVisual kind={item.kind} />
      </Link>
    </motion.div>
  );
}

function AssetBentoVisual({ kind }: { kind: string }) {
  if (kind === "crypto") return <CryptoVisual />;
  if (kind === "forex") return <ForexVisual />;
  if (kind === "stocks") return <StocksVisual />;
  if (kind === "indices") return <IndicesVisual />;
  return <CommoditiesVisual />;
}

/** Crypto — ring + orbiting coins in dedicated visual zone */
function CryptoVisual() {
  return (
    <div className="asset-visual-zone" aria-hidden="true">
      <div className="asset-crypto-ring-wrap">
        <div className="asset-crypto-orbit">
          <div className="asset-coin asset-coin--one">₿</div>
          <div className="asset-coin asset-coin--two">Ξ</div>
          <div className="asset-coin asset-coin--three">◎</div>
        </div>
      </div>
      <span className="asset-up-badge">↗ +8.4%</span>
    </div>
  );
}

/** Forex — pair chips + sparkline stay inside visual zone */
function ForexVisual() {
  return (
    <div className="asset-visual-zone" aria-hidden="true">
      <div className="asset-pair-stack">
        <div className="asset-pair">EUR <span>/ USD</span></div>
        <div className="asset-pair">GBP <span>/ USD</span></div>
        <div className="asset-pair">USD <span>/ JPY</span></div>
      </div>
      <svg viewBox="0 0 300 80" className="asset-sparkline" aria-hidden="true">
        <path d="M0 63L44 46L82 55L119 23L164 35L202 14L245 30L300 4" />
      </svg>
    </div>
  );
}

/** Stocks — area chart at bottom, tickers inside the chart zone */
function StocksVisual() {
  return (
    <div className="asset-visual-zone" aria-hidden="true">
      <svg viewBox="0 0 280 130" className="asset-area-chart" aria-hidden="true">
        <defs>
          <linearGradient id="asset-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="var(--accent)" stopOpacity=".32" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="asset-area-fill" d="M0 118L38 96L77 106L115 67L151 83L188 44L226 60L280 10V130H0Z" />
        <path className="asset-chart-line" d="M0 118L38 96L77 106L115 67L151 83L188 44L226 60L280 10" />
      </svg>
      <div className="asset-ticker-group">
        <span className="asset-ticker">ALP</span>
        <span className="asset-ticker">VRT</span>
      </div>
    </div>
  );
}

/** Indices — bar rows in visual zone, no absolute positioning over text */
function IndicesVisual() {
  return (
    <div className="asset-visual-zone" aria-hidden="true">
      <div className="asset-index-rows">
        {(["S&P 500", "NASDAQ", "FTSE", "DAX"] as const).map((label, i) => (
          <div className="asset-index-row" key={label}>
            <span>{label}</span>
            <i style={{ width: `${48 + i * 12}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Commodities — 2x2 tile grid + price line inside visual zone */
function CommoditiesVisual() {
  return (
    <div className="asset-visual-zone" aria-hidden="true">
      <div className="asset-commodity-grid">
        {([["Au", "Gold"], ["◒", "Oil"], ["⌁", "Gas"], ["✦", "Wheat"]] as const).map(([symbol, label]) => (
          <div className="asset-commodity" key={label}>
            <b>{symbol}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 640 56" className="asset-commodity-line" aria-hidden="true">
        <path d="M0 42L75 34L142 44L212 18L288 30L366 12L442 34L520 20L640 6" />
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Testimonials Wheel Carousel
   ────────────────────────────────────────────────────────────────── */

const N = testimonials.length;

/** Shortest circular offset from active index to card i */
function circularOffset(i: number, active: number): number {
  const raw = ((i - active + N + Math.floor(N / 2)) % N) - Math.floor(N / 2);
  return raw;
}

function TestimonialsMarquee() {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => setStageWidth(stage.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    setActive((prev) => (prev + dir + N) % N);
  }, []);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
  }, []);

  /* keyboard support */
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    },
    [go],
  );

  return (
    <div
      ref={wrapRef}
      className="testimonial-wheel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      tabIndex={0}
      onKeyDown={handleKey}
    >
      {/* Dots */}
      <div className="testimonial-wheel-dots" role="tablist" aria-label="Select testimonial">
        {testimonials.map((t, i) => (
          <button
            key={t.name}
            className="testimonial-wheel-dot"
            role="tab"
            aria-current={i === active ? "true" : undefined}
            aria-label={`Go to testimonial ${i + 1}: ${t.name}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Stage */}
      <div ref={stageRef} className="testimonial-wheel-stage" style={{ "--wheel-card-width": stageWidth ? `${Math.min(stageWidth * 0.78, 320)}px` : undefined } as React.CSSProperties}>
        <div className="testimonial-wheel-track">
          {testimonials.map((item, i) => {
            const offset = circularOffset(i, active);
            const abs = Math.abs(offset);
            const visible = abs <= 1;
            const isActive = offset === 0;

            /* wheel arc transform values */
            const mobile = stageWidth > 0 && stageWidth < 768;
            const cardWidth = mobile ? Math.min(stageWidth * 0.78, 320) : 0;
            const STEP_X = mobile ? cardWidth * 0.82 : 310;
            const STEP_Y = mobile ? cardWidth * 0.07 : 24;
            const STEP_DEG = 8;        // deg tilt per step
            const ORIGIN_RADIUS = mobile ? cardWidth * 3.5 : 1400;
            const scale = isActive ? 1 : mobile ? 0.9 : 0.92;
            const opacity = isActive ? 1 : abs === 1 ? 0.7 : 0;

            if (reducedMotion) {
              /* crossfade only */
              return (
                <div
                  key={item.name}
                  className="testimonial-wheel-card"
                  data-active={isActive ? "true" : undefined}
                  aria-hidden={visible ? undefined : true}
                  style={{ opacity, pointerEvents: isActive ? undefined : "none" }}
                  onClick={() => !isActive && abs === 1 && goTo(i)}
                >
                  <WheelCardContent item={item} isActive={isActive} />
                </div>
              );
            }

            return (
              <motion.div
                key={item.name}
                className="testimonial-wheel-card"
                data-active={isActive ? "true" : undefined}
                aria-hidden={visible ? undefined : true}
                aria-live={isActive ? "polite" : undefined}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, info) => {
                  const { offset: { x }, velocity: { x: vx } } = info;
                  if (x < -60 || vx < -400) go(1);
                  else if (x > 60 || vx > 400) go(-1);
                }}
                animate={{
                  x: offset * STEP_X,
                  y: abs * STEP_Y,
                  rotate: offset * STEP_DEG,
                  scale,
                  opacity,
                }}
                style={{ transformOrigin: `50% ${ORIGIN_RADIUS}px`, zIndex: isActive ? 10 : 5 - abs }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                onClick={() => !isActive && abs === 1 && goTo(i)}
                whileTap={isActive ? { scale: 0.98 } : {}}
              >
                <WheelCardContent item={item} isActive={isActive} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <div className="testimonial-wheel-controls">
        <button
          className="testimonial-wheel-btn testimonial-wheel-btn--prev"
          aria-label="Previous testimonial"
          onClick={() => go(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          className="testimonial-wheel-btn testimonial-wheel-btn--next"
          aria-label="Next testimonial"
          onClick={() => go(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function WheelCardContent({ item, isActive }: { item: typeof testimonials[number]; isActive: boolean }) {
  return (
    <>
      <div className="testimonial-wheel-avatar" aria-hidden="true">{item.initials}</div>
      <p className="testimonial-wheel-name">{item.name}</p>
      <p className="testimonial-wheel-role">{item.role}</p>
      <div className="testimonial-wheel-stars" aria-label={`${item.rating} out of 5 stars`}>
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
        ))}
        <span>5.0</span>
      </div>
      <p
        className="testimonial-wheel-quote"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        &ldquo;{item.text}&rdquo;
      </p>
    </>
  );
}
