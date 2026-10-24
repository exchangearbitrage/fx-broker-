import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const paymentKeys = new Set(["btcAddress", "ethAddress", "usdtTrc20Address", "usdtErc20Address", "solAddress"]);

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ paymentKey: string }> }) {
  if (!await getCurrentUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { paymentKey } = await params;
  if (!paymentKeys.has(paymentKey)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const media = await prisma.paymentInstructionMedia.findUnique({ where: { paymentKey } });
  if (!media) return NextResponse.json({ error: "No QR image has been uploaded for this payment method." }, { status: 404 });
  return new NextResponse(new Uint8Array(media.content), { headers: { "Content-Type": media.mimeType, "Content-Length": String(media.size), "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="${media.originalName.replaceAll('"', "")}"` } });
}
