import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getBrandConfig } from "@/config/loadBrandConfig";

export default function RegisterPage() {
  const brand = getBrandConfig();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Open Account</p>
        <h1 className="font-heading text-5xl font-semibold">Start trading with your account</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-brand-secondary">Create a secure account, verify your identity, and practice with virtual funds before choosing whether to trade live where available.</p>
      </div>
      <div>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-brand-secondary">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-primary">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
