"use client";

import { useMemo, useState } from "react";
import type { BrandConfig } from "@/config/brand.schema";

type KycPreviewFormProps = {
  kyc: BrandConfig["kyc"];
  onSubmitted?: () => void;
};

export function KycPreviewForm({ kyc, onSubmitted }: KycPreviewFormProps) {
  const countries = Object.entries(kyc.countryIdRequirements);
  const [country, setCountry] = useState(countries[0]?.[0] ?? "default");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const requirement = useMemo(() => kyc.countryIdRequirements[country] ?? kyc.defaultRequirement, [country, kyc]);

  async function submit(formData: FormData) {
    setStatus("loading");
    setError("");
    formData.set("country", country);
    const response = await fetch("/api/kyc", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
    if (!response.ok) {
      setStatus("error");
      setError("We couldn’t submit your document. Please check the file and try again.");
      return;
    }
    setStatus("success");
    onSubmitted?.();
  }

  return (
    <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <form action={submit} className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <label className="grid gap-2 text-sm font-medium">
          Country
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm">
            {countries.map(([code, item]) => (
              <option key={code} value={code}>
                {item.label}
              </option>
            ))}
            <option value="default">{kyc.defaultRequirement.label}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {requirement.idNumberLabel}
          <input name="idNumber" required className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" placeholder={requirement.idNumberLabel} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Identity document
          <select name="documentType" className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm">
            {requirement.acceptedDocuments.map((document) => (
              <option key={document}>{document}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Upload document
          <input name="document" required type="file" accept="image/*,.pdf" className="rounded-brand border border-dashed border-white/20 bg-brand-surface px-4 py-4 text-sm transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary hover:border-brand-primary/50" />
          <span className="text-xs font-normal text-brand-secondary">Upload a clear image or PDF. Your document is reviewed manually by our compliance team.</span>
        </label>
        {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
        {status === "success" ? <p className="text-sm text-brand-success">Verification submitted for review.</p> : null}
        <button disabled={status === "loading"} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
          {status === "loading" ? "Submitting..." : "Submit verification"}
        </button>
      </form>
    </div>
  );
}
