"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function LoginForm({ brandName }: { brandName: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = (await response.json().catch(() => null)) as { role?: string; errors?: Record<string, string[]> } | null;
    setLoading(false);
    if (!response.ok) {
      setError(data?.errors?.email?.[0] ?? data?.errors?.password?.[0] ?? data?.errors?.form?.[0] ?? "We couldn’t sign you in right now. Please try again in a moment.");
      return;
    }
    router.push(data?.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <form action={submit} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <input name="email" type="email" required className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <PasswordInput name="password" required autoComplete="current-password" className="min-h-11 w-full rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
        </label>
        <div className="flex items-center justify-between text-sm text-brand-secondary">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>
          <Link href="/auth/reset-password" className="hover:text-brand-text">
            Forgot password?
          </Link>
        </div>
        <button disabled={loading} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <p className="text-sm text-brand-danger" role="alert">{error}</p> : null}
        <p className="text-center text-sm text-brand-secondary">
          New to {brandName}?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-primary">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
