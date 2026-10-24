"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ENGLISH } from "@/lib/translations/english";
import { useAuth } from "@/context/AuthContext";

export type Translations = Record<string, string>;
export const LANGUAGE_NAMES: Record<string, string> = { en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese", it: "Italian", nl: "Dutch", pl: "Polish", ru: "Russian", tr: "Turkish", ar: "Arabic", hi: "Hindi", bn: "Bengali", ur: "Urdu", id: "Indonesian", vi: "Vietnamese", th: "Thai", "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)", ja: "Japanese", ko: "Korean", sw: "Swahili", ha: "Hausa", yo: "Yoruba", ig: "Igbo" };
export const GOOGLE_LANGUAGE_CODES = Object.keys(LANGUAGE_NAMES).join(",");
const RTL_LANGUAGES = new Set(["ar", "ur"]);
type LanguageContextValue = { language: string; languageNames: Record<string, string>; t: Translations; setLanguage: (language: string) => void };
const LanguageContext = createContext<LanguageContextValue>({ language: "en", languageNames: LANGUAGE_NAMES, t: ENGLISH, setLanguage: () => undefined });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState("en");
  const setLanguage = useCallback((next: string) => { const resolved = LANGUAGE_NAMES[next] ? next : "en"; setLanguageState(resolved); window.localStorage.setItem("language", resolved); document.documentElement.lang = resolved; document.documentElement.dir = RTL_LANGUAGES.has(resolved) ? "rtl" : "ltr"; window.dispatchEvent(new CustomEvent("brokerage:language-change", { detail: resolved })); if (isAuthenticated) void fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferredLanguage: resolved, displayCurrencyManuallySet: true }) }); }, [isAuthenticated]);
  useEffect(() => { const manual = window.localStorage.getItem("language"); const browser = navigator.language; const preferred = manual && LANGUAGE_NAMES[manual] ? manual : Object.keys(LANGUAGE_NAMES).find((code) => browser === code || browser.startsWith(`${code}-`)) ?? "en"; setLanguage(preferred); }, [setLanguage]);
  return <LanguageContext.Provider value={{ language, languageNames: LANGUAGE_NAMES, t: ENGLISH, setLanguage }}>{children}</LanguageContext.Provider>;
}
export function useTranslation() { return useContext(LanguageContext); }
