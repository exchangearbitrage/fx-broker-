import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const paymentKeys = new Set(["btcAddress", "ethAddress", "usdtTrc20Address", "usdtErc20Address", "solAddress"]);
const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const maxUploadBytes = 2 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ paymentKey: string }> }) {
  await requireAdmin();
  const { paymentKey } = await params;
  if (!paymentKeys.has(paymentKey)) return NextResponse.json({ error: "This payment method cannot have a QR image." }, { status: 404 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a QR image to upload." }, { status: 400 });
  if (!acceptedTypes.has(file.type)) return NextResponse.json({ error: "Use a PNG, JPEG, WebP, or GIF image for the QR code." }, { status: 400 });
  if (file.size === 0 || file.size > maxUploadBytes) return NextResponse.json({ error: "The QR image must be between 1 byte and 2 MB." }, { status: 400 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 180) || "payment-qr";
  const content = Buffer.from(await file.arrayBuffer());
  const media = await prisma.paymentInstructionMedia.upsert({ where: { paymentKey }, update: { content, originalName: safeName, mimeType: file.type, size: file.size }, create: { paymentKey, content, originalName: safeName, mimeType: file.type, size: file.size }, select: { paymentKey: true, originalName: true, updatedAt: true } });
  return NextResponse.json({ ok: true, media });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ paymentKey: string }> }) {
  await requireAdmin();
  const { paymentKey } = await params;
  if (!paymentKeys.has(paymentKey)) return NextResponse.json({ error: "This payment method cannot have a QR image." }, { status: 404 });
  await prisma.paymentInstructionMedia.deleteMany({ where: { paymentKey } });
  return NextResponse.json({ ok: true });
}
