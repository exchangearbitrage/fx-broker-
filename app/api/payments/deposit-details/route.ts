import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getCurrentUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [config, media] = await Promise.all([
    prisma.globalPaymentConfig.upsert({ where: { id: "global-config" }, update: {}, create: { id: "global-config" } }),
    prisma.paymentInstructionMedia.findMany({ select: { paymentKey: true, originalName: true } }),
  ]);
  return NextResponse.json({
    ...config,
    media: Object.fromEntries(media.map((item: { paymentKey: string; originalName: string }) => [item.paymentKey, { name: item.originalName, url: `/api/payments/media/${item.paymentKey}` }])),
  });
}
