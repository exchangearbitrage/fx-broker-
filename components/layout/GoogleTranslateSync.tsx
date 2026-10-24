"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { GOOGLE_LANGUAGE_CODES, useTranslation } from "@/context/LanguageContext";

declare global { interface Window { google?: { translate: { TranslateElement: new (options: { pageLanguage: string; autoDisplay?: boolean; includedLanguages: string }, id: string) => void } }; googleTranslateElementInit?: () => void; } }
function setCookie(value: string, expires = "") { const hostname = window.location.hostname; const cookies = [`googtrans=${value}; path=/;${expires}`, `googtrans=${value}; path=/; domain=${hostname};${expires}`]; if (hostname.includes(".")) cookies.push(`googtrans=${value}; path=/; domain=.${hostname};${expires}`); cookies.forEach((cookie) => { document.cookie = cookie; }); }
export function GoogleTranslateSync() {
  const { language } = useTranslation(); const initialized = useRef(false); const enabled = process.env.NEXT_PUBLIC_AUTO_TRANSLATE !== "false";
  useEffect(() => { window.googleTranslateElementInit = () => { if (!initialized.current && window.google?.translate?.TranslateElement) { new window.google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false, includedLanguages: GOOGLE_LANGUAGE_CODES }, "google_translate_element"); initialized.current = true; } }; }, []);
  useEffect(() => { if (!enabled) return; if (language === "en") { setCookie("/en/en", "expires=Thu, 01 Jan 1970 00:00:00 GMT;"); return; } setCookie(`/en/${language}`); const started = Date.now(); const timer = window.setInterval(() => { const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo"); if (combo) { combo.value = language; combo.dispatchEvent(new Event("change")); window.clearInterval(timer); } else if (Date.now() - started > 4000) window.clearInterval(timer); }, 200); return () => window.clearInterval(timer); }, [enabled, language]);
  return enabled ? <><Script id="google-translate-script" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="lazyOnload" /><div id="google_translate_element" className="notranslate" aria-hidden="true" /></> : null;
}
