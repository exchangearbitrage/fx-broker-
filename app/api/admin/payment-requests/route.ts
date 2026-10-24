import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
export async function GET() { await requireAdmin(); return NextResponse.json(await prisma.paymentRequest.findMany({ include: { user: { select: { email: true, firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } })); }
