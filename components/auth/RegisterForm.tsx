"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PuzzleCaptcha } from "@/components/auth/PuzzleCaptcha";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FlagCombobox } from "@/components/ui/FlagCombobox";

export function RegisterForm() {
  const [countries, setCountries] = useState<Country[]>([]); const [countryCode, setCountryCode] = useState(""); const [dialCode, setDialCode] = useState(""); const [phoneLocal, setPhoneLocal] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [challenge, setChallenge] = useState<{ id: string; answer: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const handleChallenge = useCallback((id: string, answer: number | null) => {
    setChallenge(answer === null ? null : { id, answer });
  }, []);
  useEffect(() => { fetch("/api/countries").then((response) => response.ok ? response.json() : []).then((items: Country[]) => { setCountries(items); const detected = items.find((item) => item.cca2 === new Intl.Locale(navigator.language).region) ?? items.find((item) => item.cca2 === "US") ?? items[0]; if (detected) { setCountryCode(detected.cca2); setDialCode(detected.dialCode); setDisplayCurrency(detected.currencies[0]?.code ?? "USD"); } }).catch(() => undefined); }, []);
  const selectedCountry = useMemo(() => countries.find((item) => item.cca2 === countryCode), [countries, countryCode]);

  async function submit(formData: FormData) {
    setLoading(true);
    setErrors({});
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        country: selectedCountry?.name ?? "",
        countryCode,
        phone: `${dialCode}${phoneLocal.replace(/\s+/g, "")}`,
        accountCurrency: "USD",
        localCurrency: selectedCountry?.currencies[0]?.code ?? "USD",
        displayCurrency,
        preferredLanguage: languageForCountry(countryCode),
        dateOfBirth: `${formData.get("birthYear")}-${String(formData.get("birthMonth")).padStart(2, "0")}-${String(formData.get("birthDay")).padStart(2, "0")}`,
        challengeId: challenge?.id ?? "",
        challengeAnswer: challenge?.answer ?? -1,
      }),
    });
    const data = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
    setLoading(false);
    if (!response.ok) {
      setErrors(data?.errors ?? { form: ["We couldn’t create your account right now. Please try again in a moment."] });
      return;
    }
    window.location.href = "/onboarding/kyc";
  }

  return (
    <form action={submit} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="firstName" label="First name" error={errors.firstName?.[0]} />
          <Field name="lastName" label="Last name" error={errors.lastName?.[0]} />
        </div>
        <Field name="email" label="Email address" type="email" error={errors.email?.[0]} />
        <div className="grid items-start gap-4 sm:grid-cols-2"><div className="grid gap-1"><FlagCombobox required label="Country of residence" value={countryCode} options={countries.map((country) => ({ value: country.cca2, label: country.name, flag: country.flag }))} onChange={(nextCode) => { const next = countries.find((country) => country.cca2 === nextCode); setCountryCode(nextCode); if (next) { setDialCode(next.dialCode); setDisplayCurrency(next.currencies[0]?.code ?? "USD"); } }} />{errors.country?.[0] ? <span className="text-xs font-normal text-brand-danger">{errors.country[0]}</span> : null}</div><div className="grid gap-2"><FlagCombobox label="Display currency" value={displayCurrency} showFlag={false} options={Array.from(new Set(["USD", "EUR", "GBP", "NGN", ...countries.flatMap((country) => country.currencies.map((currency) => currency.code))])).sort().map((code) => ({ value: code, label: code, detail: currencyName(code) }))} onChange={setDisplayCurrency} /><span className="text-xs font-normal text-brand-secondary">Your account is held in USD. Amounts are shown in this currency.</span></div></div>
        <fieldset className="grid gap-2 text-sm font-medium"><legend>Phone number</legend><div className="flex items-start gap-2"><div className="shrink-0"><FlagCombobox visuallyHiddenLabel displayDetail label="Country code" value={dialCode} options={countries.filter((country, index, all) => country.dialCode && all.findIndex((item) => item.dialCode === country.dialCode) === index).map((country) => ({ value: country.dialCode, label: country.name, detail: country.dialCode, flag: country.flag }))} onChange={setDialCode} /></div><input required inputMode="tel" autoComplete="tel" value={phoneLocal} onChange={(event) => setPhoneLocal(event.target.value)} placeholder="Phone number" className="min-h-11 min-w-0 flex-1 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25" /></div>{errors.phone?.[0] ? <span className="text-xs font-normal text-brand-danger">{errors.phone[0]}</span> : null}</fieldset>
        <fieldset className="grid gap-2 text-sm font-medium"><legend>Date of birth</legend><div className="grid grid-cols-3 gap-2"><select className="min-h-11 min-w-0 rounded-brand border border-white/10 bg-brand-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25" name="birthDay" required autoComplete="bday-day" defaultValue=""><option value="" disabled>Day</option>{Array.from({ length: 31 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select><select className="min-h-11 min-w-0 rounded-brand border border-white/10 bg-brand-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25" name="birthMonth" required autoComplete="bday-month" defaultValue=""><option value="" disabled>Month</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select><select className="min-h-11 min-w-0 rounded-brand border border-white/10 bg-brand-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25" name="birthYear" required autoComplete="bday-year" defaultValue=""><option value="" disabled>Year</option>{Array.from({ length: 100 }, (_, index) => <option key={new Date().getFullYear() - 18 - index}>{new Date().getFullYear() - 18 - index}</option>)}</select></div>{errors.dateOfBirth?.[0] ? <span className="text-xs font-normal text-brand-danger">{errors.dateOfBirth[0]}</span> : null}</fieldset>
        <PasswordField name="password" label="Password" autoComplete="new-password" hint="Use at least 8 characters." error={errors.password?.[0]} />
        <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" error={errors.confirmPassword?.[0]} />
        <PuzzleCaptcha onSolved={handleChallenge} />
        {errors.challengeAnswer?.[0] ? <p className="text-sm text-brand-danger">{errors.challengeAnswer[0]}</p> : null}
        {errors.form?.[0] ? <p className="text-sm text-brand-danger">{errors.form[0]}</p> : null}
        <label className="flex items-start gap-3 text-sm text-brand-secondary">
          <input type="checkbox" required className="mt-1" />I confirm that I have read the risk warning and agree to the account terms.
        </label>
        <button disabled={loading || !challenge} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

type Country = { name: string; cca2: string; dialCode: string; currencies: Array<{ code: string; name: string; symbol: string }>; flag: string };

function Field({ name, label, type = "text", error }: { name: string; label: string; type?: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input name={name} type={type} required autoComplete={type === "email" ? "email" : undefined} aria-invalid={Boolean(error)} className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary aria-[invalid=true]:border-brand-danger" />
      {error ? <span className="text-xs font-normal text-brand-danger">{error}</span> : null}
    </label>
  );
}

function PasswordField({ name, label, hint, error, autoComplete }: { name: string; label: string; hint?: string; error?: string; autoComplete: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<PasswordInput name={name} required autoComplete={autoComplete} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary aria-[invalid=true]:border-brand-danger" />{error ? <span className="text-xs font-normal text-brand-danger">{error}</span> : hint ? <span className="text-xs font-normal text-brand-secondary">{hint}</span> : null}</label>;
}

function currencyName(code: string) { try { return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code; } catch { return code; } }

function languageForCountry(countryCode: string) {
  if (["ES", "MX", "AR", "CO", "CL", "PE"].includes(countryCode)) return "es";
  if (["EG", "SA", "AE", "MA"].includes(countryCode)) return "ar";
  if (["BR", "PT"].includes(countryCode)) return "pt";
  if (["FR", "BE", "SN", "CI"].includes(countryCode)) return "fr";
  if (["DE", "AT"].includes(countryCode)) return "de";
  if (countryCode === "NG") return "en";
  return "en";
}
