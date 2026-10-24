import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

type ReviewProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: ReviewProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: string; notes?: string } | null;
  const status = ["APPROVED", "REJECTED", "PENDING"].includes(body?.status ?? "") ? body?.status! : null;

  if (!status) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const submission = await prisma.kycSubmission.update({
    where: { id },
    data: {
      status,
      notes: body?.notes ?? "",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });
  await prisma.user.update({ where: { id: submission.userId }, data: { kycStatus: status, kycRejectionNote: status === "REJECTED" ? body?.notes ?? "" : "", humanVerifiedAt: status === "APPROVED" ? new Date() : null } });
  await createNotification({
    recipientId: submission.userId,
    actorId: admin.id,
    type: notificationTypes.kycStatusUpdate,
    title: `Identity verification ${status.toLowerCase()}`,
    body: status === "APPROVED"
      ? "Your identity verification has been approved."
      : status === "REJECTED"
        ? "Your identity verification needs attention. Review the note and submit an updated document."
        : "Your identity verification status has been updated.",
    metadata: { kycId: submission.id, status, href: "/onboarding/kyc" },
  });

  return NextResponse.json({ ok: true, submission });
}
