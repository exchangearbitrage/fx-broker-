"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setStatus("loading");
    setError("");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
      setStatus("error");
      setError(result?.errors ? Object.values(result.errors).flat()[0] ?? "Please check the form." : "Please check the form.");
      return;
    }

    setStatus("success");
  }

  return (
    <form action={submit} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Field name="name" label="Name" />
        <Field name="email" label="Email" type="email" />
        <Field name="subject" label="Subject" />
        <label className="grid gap-2 text-sm font-medium">
          Message
          <textarea name="message" rows={5} className="rounded-brand border border-white/10 bg-brand-surface px-4 py-3 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
        </label>
        {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
        {status === "success" ? <p className="text-sm text-brand-success">Message received. Support will review your request shortly.</p> : null}
        <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending..." : "Send message"}</Button>
      </div>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input name={name} type={type} className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
    </label>
  );
}
