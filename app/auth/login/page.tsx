import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function LoginPage() {
  const brand = getBrandConfig();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Client Area</p>
        <h1 className="font-heading text-5xl font-semibold">Welcome back</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-brand-secondary">Sign in to manage your account, monitor open positions, review balances, and continue trading on the platform.</p>
      </div>
      <LoginForm brandName={brand.brand.name} />
    </main>
  );
}
