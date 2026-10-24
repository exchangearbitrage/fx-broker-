import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { KycPreviewForm } from "@/components/kyc/KycPreviewForm";
export default async function KycOnboardingPage() { const user = await getCurrentUser(); if (!user) redirect("/auth/login?redirect=%2Fonboarding%2Fkyc"); const brand = getBrandConfig(); return <main className="min-h-screen bg-brand-background px-4 py-12"><div className="mx-auto max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Account onboarding</p><h1 className="mt-2 font-heading text-3xl font-bold text-white">Verify your identity</h1><p className="mt-3 text-sm leading-6 text-brand-secondary">Identity verification is required before full account access. Use a passport, driver’s licence, or government-issued ID.</p><div className="mt-6"><KycPreviewForm kyc={brand.kyc} /></div></div></main>; }
