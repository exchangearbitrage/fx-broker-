import { AdminKycQueue } from "@/components/admin/AdminKycQueue";

export default function AdminKycPage() {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Verification</p>
      <h2 className="font-heading text-4xl font-semibold">KYC review queue</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-brand-secondary">Check each customer’s identity information against the submitted documents, request missing details when necessary, and record a decision that can be explained later.</p>
      <section className="mt-8">
        <AdminKycQueue />
      </section>
    </div>
  );
}
