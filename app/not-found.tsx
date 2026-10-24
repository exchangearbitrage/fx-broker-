import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">404</p>
      <h1 className="mt-4 font-heading text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-brand-secondary">This page is unavailable or the feature is disabled for the active brand.</p>
      <Link href="/" className="mt-8 rounded-brand bg-brand-primary px-5 py-3 text-sm font-semibold text-black">
        Return home
      </Link>
    </main>
  );
}
