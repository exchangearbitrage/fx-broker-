import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
export async function GET() { await requireAdmin(); const users = await prisma.user.findMany({ where: { role: "USER" }, select: { id: true, firstName: true, lastName: true, email: true, kycStatus: true, membershipPlan: true, accountManagerMessages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderRole: true } } }, orderBy: { updatedAt: "desc" } }); return NextResponse.json(users); }
