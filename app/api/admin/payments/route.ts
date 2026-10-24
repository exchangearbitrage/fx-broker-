import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const fields = ["btcAddress", "ethAddress", "usdtTrc20Address", "usdtErc20Address", "solAddress", "bankName", "accountName", "accountNumber", "swiftBic", "routingNumber", "wireInstructions"] as const;

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const [config, media] = await Promise.all([
    prisma.globalPaymentConfig.upsert({ where: { id: "global-config" }, update: {}, create: { id: "global-config" } }),
    prisma.paymentInstructionMedia.findMany({ select: { paymentKey: true, originalName: true, updatedAt: true } }),
  ]);

  return NextResponse.json({
    ...config,
    media: Object.fromEntries(media.map((item: { paymentKey: string; originalName: string; updatedAt: Date }) => [item.paymentKey, { name: item.originalName, updatedAt: item.updatedAt }])),
  });
}

export async function PUT(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => ({}));
  const data = Object.fromEntries(fields.map((key) => [key, typeof body[key] === "string" ? body[key].trim() : ""]));
  return NextResponse.json(await prisma.globalPaymentConfig.upsert({ where: { id: "global-config" }, update: data, create: { id: "global-config", ...data } }));
}
