"use client";

import { useEffect, useState } from "react";
import { PullToRefresh } from "@/components/block/PullToRefresh";

type Submission = {
  id: string;
  countryLabel: string;
  idNumberLabel: string;
  idNumber: string;
  documentType: string;
  originalName: string;
  mimeType?: string;
  status: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
};

export function AdminKycQueue() {
  const [items, setItems] = useState<Submission[]>([]);

  async function load() {
    const response = await fetch("/api/admin/kyc", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { submissions: Submission[] };
      setItems(data.submissions);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
    const notes = status === "REJECTED" ? window.prompt("Reason for rejection (shown to the user):") ?? "" : "";
    if (status === "REJECTED" && !notes) return;
    await fetch(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    await load();
  }

  return (
    <PullToRefresh onRefresh={load}>
      <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="mb-2 grid gap-2 p-2 sm:grid-cols-3">
          {[
            { label: "Total submissions", value: items.length },
            { label: "Pending review", value: items.filter((item) => item.status === "PENDING").length },
            { label: "Completed", value: items.filter((item) => item.status !== "PENDING").length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-brand bg-brand-background/45 p-4">
              <p className="font-heading text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-brand-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-brand bg-brand-background/45">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-brand-secondary">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">ID number</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{[item.user.firstName, item.user.lastName].filter(Boolean).join(" ") || item.user.email}</p>
                    <p className="text-xs text-brand-secondary">{item.user.email}</p>
                  </td>
                  <td className="px-4 py-4">{item.countryLabel}</td>
                  <td className="px-4 py-4">
                    <p>{item.idNumber}</p>
                    <p className="text-xs text-brand-secondary">{item.idNumberLabel}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{item.documentType}</p>
                    <a href={`/api/admin/kyc-download/${item.id}?inline=1`} target="_blank" className="mr-3 text-xs font-semibold text-white">Preview</a>
                    <a href={`/api/admin/kyc-download/${item.id}`} className="text-xs font-semibold text-brand-primary">
                      Download {item.originalName}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold">{item.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => review(item.id, "APPROVED")} className="rounded-brand bg-brand-primary px-3 py-2 text-xs font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
                        Approve
                      </button>
                      <button type="button" onClick={() => review(item.id, "REJECTED")} className="rounded-brand bg-brand-danger px-3 py-2 text-xs font-semibold text-white transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
                        Reject
                      </button>
                      <button type="button" onClick={() => review(item.id, "PENDING")} className="rounded-brand border border-white/10 px-3 py-2 text-xs font-semibold text-brand-secondary">Pending</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length ? null : <p className="p-6 text-sm text-brand-secondary">No KYC submissions yet.</p>}
        </div>
      </div>
    </PullToRefresh>
  );
}
