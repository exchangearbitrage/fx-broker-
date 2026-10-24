import { AdminSupportThreads } from "@/components/admin/AdminSupportThreads";

export default function AdminSupportPage() {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Customer care</p>
      <h2 className="font-heading text-4xl font-semibold">Support messages</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-brand-secondary">Read the customer’s latest message, review the conversation history, and send a clear reply without losing track of the account context.</p>
      <section className="mt-8">
        <AdminSupportThreads view="messages" />
      </section>
    </div>
  );
}
