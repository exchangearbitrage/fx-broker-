import { NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveKycDocument } from "@/lib/storage/localStorage";
import { createAdminNotifications, notificationTypes } from "@/lib/services/notifications";
import { kycSchema } from "@/lib/validation/kyc";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const submissions = await prisma.kycSubmission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();
  const parsed = kycSchema.safeParse({
    country: formData.get("country"),
    idNumber: formData.get("idNumber"),
    documentType: formData.get("documentType"),
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, errors: { document: ["Upload an identity document."] } }, { status: 400 });
  }

  const brand = getBrandConfig();
  const requirement = brand.kyc.countryIdRequirements[parsed.data.country] ?? brand.kyc.defaultRequirement;
  const stored = await saveKycDocument(file, user.id);
  const submission = await prisma.kycSubmission.create({
    data: {
      userId: user.id,
      country: parsed.data.country,
      countryLabel: requirement.label,
      idNumberLabel: requirement.idNumberLabel,
      idNumber: parsed.data.idNumber,
      documentType: parsed.data.documentType,
      documentPath: stored.path,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { kycStatus: "PENDING", kycRejectionNote: "" } });
  await createAdminNotifications({
    actorId: user.id,
    type: notificationTypes.kycSubmitted,
    title: "New KYC submission",
    body: `${user.firstName || user.email} submitted identity verification documents.`,
    metadata: { kycId: submission.id, userId: user.id, href: "/admin/kyc" },
  });

  return NextResponse.json({ ok: true, submission });
}
