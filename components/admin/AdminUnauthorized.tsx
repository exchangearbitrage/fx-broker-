"use client";
import Link from "next/link";
export function AdminUnauthorized({ email }: { email: string }) {
  async function signInAsAdmin() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  return <main className="grid min-h-screen place-items-center bg-brand-background p-6"><section className="max-w-lg rounded-2xl border border-amber-400/25 bg-brand-surface p-8 text-center shadow-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Access restricted</p><h1 className="mt-3 font-heading text-3xl font-bold text-white">Administrator access required</h1><p className="mt-3 text-sm leading-6 text-brand-secondary">You are currently signed in as a Trader account ({email}). Sign in with an administrator account to access operations.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={signInAsAdmin} className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-black">Sign in as Administrator</button><Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white">Return to Trader Dashboard</Link></div></section></main>;
}
