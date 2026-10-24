import { getCurrentUser } from "@/lib/auth/session";
import { OverviewDashboard } from "@/components/portal/OverviewDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Trading Dashboard & Cockpit",
  description: "Manage multi-asset positions, equity, margin, automated copy trading, and yield vaults.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard");
  return <OverviewDashboard firstName={user.firstName} />;
}
