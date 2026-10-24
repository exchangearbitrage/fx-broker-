import { getBrandConfig } from "@/config/loadBrandConfig";

export default function RegulationPage() {
  const brand = getBrandConfig();
  const fields = [
    { label: "Regulator", value: brand.legal.regulatorName },
    { label: "License number", value: brand.legal.licenseNumber },
    { label: "Regulator URL", value: brand.legal.regulatorUrl },
  ].filter((field) => field.value);

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Legal</p>
      <h1 className="font-heading text-5xl font-semibold">Legal & Regulation</h1>
      <p className="mt-5 text-lg leading-8 text-brand-secondary">Review available legal, regulatory, and risk information before opening or funding an account.</p>
      <div className="mt-10 grid gap-4">
        {fields.length ? (
          fields.map((field) => (
            <div key={field.label} className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-secondary">{field.label}</p>
              {field.label === "Regulator URL" ? (
                <a href={field.value} className="mt-2 block font-semibold text-brand-primary">{field.value}</a>
              ) : (
                <p className="mt-2 font-semibold">{field.value}</p>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 text-brand-secondary shadow-border">
            Regulatory details are not currently displayed for this account type. Contact support if you need more information before trading.
          </div>
        )}
        {brand.legal.riskWarningText ? (
          <div className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-secondary">Risk warning</p>
            <p className="mt-2 leading-7">{brand.legal.riskWarningText}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
