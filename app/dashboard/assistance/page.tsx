import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { AccountAssistanceView } from "@/components/portal/AccountAssistanceView";

export const metadata = { title: "Verification & Support", description: "Manual identity review status and customer care conversations." };

export default async function AssistancePage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard%2Fassistance");
  return <AccountAssistanceView kyc={getBrandConfig().kyc} initialStatus={user.kycStatus ?? "PENDING"} initialRejectionNote={user.kycRejectionNote ?? ""} />;
}
