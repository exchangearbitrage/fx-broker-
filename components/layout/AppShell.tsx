"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { DepositActivityToast } from "@/components/layout/DepositActivityToast";
import { NavigationFeedback } from "@/components/layout/NavigationFeedback";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPortal = pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <NavigationFeedback />
      {!isPortal && <Header />}
      {children}
      {!isPortal && <Footer />}
      <CookieConsent />
      {!isPortal && <DepositActivityToast />}
    </div>
  );
}
