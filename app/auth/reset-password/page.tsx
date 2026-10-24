import Link from "next/link";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function ResetPasswordPage() {
  const brand = getBrandConfig();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Account Security</p>
        <h1 className="font-heading text-5xl font-semibold">Reset your password</h1>
        <p className="mt-5 text-lg leading-8 text-brand-secondary">Enter the email address linked to your account and we will send instructions for creating a new password.</p>
      </div>
      <form className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
          <label className="grid gap-2 text-sm font-medium">
            Email address
            <input type="email" className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
          </label>
          <button type="button" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
            Send reset link
          </button>
          <Link href="/auth/login" className="text-center text-sm font-semibold text-brand-primary">
            Back to sign in
          </Link>
        </div>
      </form>
    </main>
  );
}
