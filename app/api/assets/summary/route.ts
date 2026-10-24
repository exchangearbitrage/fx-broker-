import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { accountSnapshot } from "@/lib/services/ledger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requestedType = request.nextUrl.searchParams.get("accountType");
  const accountType = requestedType === "LIVE" || requestedType === "DEMO" ? requestedType : undefined;
  const [accounts, positions, transactions] = await Promise.all([
    accountSnapshot(user.id, accountType),
    prisma.position.findMany({ where: { userId: user.id, status: "OPEN", ...(accountType ? { accountType } : {}) }, orderBy: { openedAt: "desc" } }),
    prisma.transaction.findMany({ where: { userId: user.id, ...(accountType ? { accountType } : {}) }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const stakes = accountType === "LIVE" || !accountType ? await prisma.stakingPosition.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { startedAt: "desc" } }) : [];
  return NextResponse.json({ accounts, positions, stakes, transactions });
}