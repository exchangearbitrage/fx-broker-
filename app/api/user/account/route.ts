import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { accountSnapshot } from "@/lib/services/ledger";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await accountSnapshot(user.id);
  return NextResponse.json({ accounts, equity: accounts.reduce((total: number, account: { equity: number }) => total + account.equity, 0) });
}
