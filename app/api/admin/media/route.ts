import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
export async function GET() { await requireAdmin(); const [kyc, payments] = await Promise.all([prisma.kycSubmission.findMany({ include: { user: { select: { email: true, firstName: true, lastName: true } }, }, orderBy: { createdAt: "desc" } }), prisma.paymentRequest.findMany({ where: { proofPath: { not: null } }, include: { user: { select: { email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } })]); return NextResponse.json({ kyc, payments }); }
