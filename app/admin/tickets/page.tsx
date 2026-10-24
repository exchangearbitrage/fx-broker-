import { AdminSupportThreads } from "@/components/admin/AdminSupportThreads";

export default function AdminTicketsPage() {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Ticket handling</p>
      <h2 className="font-heading text-4xl font-semibold">Ticket desk</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-brand-secondary">Track open issues, review message history, and keep support work separate from verification review.</p>
      <section className="mt-8">
        <AdminSupportThreads view="tickets" />
      </section>
    </div>
  );
}
