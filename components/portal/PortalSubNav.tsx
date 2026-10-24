"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  Users,
  Coins,
  BadgeCheck,
  Settings,
  Crown,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assets & Treasury", href: "/dashboard/portfolio", icon: Briefcase },
  { label: "Trade Desk", href: "/dashboard/trade", icon: Zap },
  { label: "Copy Trading", href: "/dashboard/copy", icon: Users },
  { label: "Staking & Earn", href: "/dashboard/earn", icon: Coins },
  { label: "Membership", href: "/dashboard/plans", icon: Crown },
  { label: "Verification & Support", href: "/dashboard/assistance", icon: BadgeCheck },
  { label: "Settings & Security", href: "/dashboard/settings", icon: Settings },
];

export function PortalSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="border-b border-white/10 bg-brand-surface/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Portal Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dashboard/portfolio"
              ? pathname.startsWith("/dashboard/portfolio") || pathname.startsWith("/dashboard/wallet")
              :
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-brand-primary/15 text-brand-primary border border-brand-primary/30 shadow-inner"
                    : "text-brand-secondary hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-brand-primary" : "text-brand-secondary"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
