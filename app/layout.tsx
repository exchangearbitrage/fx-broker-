import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { buildThemeStyle } from "@/lib/theme";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleTranslateSync } from "@/components/layout/GoogleTranslateSync";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import "./globals.css";

const brand = getBrandConfig();

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.brand.domain}`),
  title: {
    default: brand.brand.name,
    template: brand.seo.titleTemplate,
  },
  description: brand.seo.description,
  keywords: brand.seo.keywords,
  icons: brand.brand.favicon ? [{ rel: "icon", url: brand.brand.favicon }] : undefined,
  openGraph: {
    title: brand.seo.description,
    description: brand.seo.description,
    images: brand.brand.ogImage ? [brand.brand.ogImage] : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.theme.background,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={brand.supportedLanguages[0] ?? "en"} data-theme="dark" style={buildThemeStyle(brand.theme)}>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CurrencyProvider>
            <LanguageProvider>
              <GoogleTranslateSync />
              <AppShell>{children}</AppShell>
            </LanguageProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
