import { getCurrentUser } from "@/lib/auth/session";
import { UserSettingsView } from "@/components/portal/UserSettingsView";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Account Settings & Security",
  description: "Manage your trading profile, password, two-factor authentication, and execution preferences.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard%2Fsettings");
  const latestSubmission = await prisma.kycSubmission.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true } });
  return <UserSettingsView initialUser={{ ...user, kycSubmissionCount: latestSubmission ? 1 : 0 }} defaultTab={resolvedSearchParams?.tab || "profile"} />;
}
