import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; const item = await prisma.paymentRequest.findUnique({ where: { id } }); if (!item?.proofPath) return NextResponse.json({ error: "Media is unavailable" }, { status: 404 }); try { const file = await readFile(item.proofPath); const inline = new URL(request.url).searchParams.get("inline") === "1"; return new NextResponse(file, { headers: { "Content-Type": item.proofMime || "application/octet-stream", "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${(item.proofName || "payment-proof").replaceAll('"', "")}"` } }); } catch { return NextResponse.json({ error: "Media is unavailable" }, { status: 404 }); } }
