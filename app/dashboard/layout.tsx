import { getCurrentUser } from "@/lib/auth/session";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalSubNav } from "@/components/portal/PortalSubNav";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { redirect } from "next/navigation";
import { AccountManagerWidget } from "@/components/support/AccountManagerWidget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard");

  return (
    <div className="min-h-screen bg-brand-background text-brand-text flex flex-col justify-between">
      <div>
        <PortalHeader user={user} />
        <PortalSubNav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <PortalFooter />
      <AccountManagerWidget />
    </div>
  );
}
