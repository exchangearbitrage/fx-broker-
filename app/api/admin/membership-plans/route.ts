import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function cleanTag(value: unknown) { return String(value ?? "STANDARD").trim().slice(0, 32).toUpperCase() || "STANDARD"; }
function cleanName(value: unknown) { return String(value ?? "").trim().slice(0, 80); }

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await prisma.membershipPlan.findMany({ orderBy: { price: "asc" } }));
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => null) as { id?: string; name?: string; badgeLabel?: string; price?: number } | null;
  const name = cleanName(body?.name);
  const price = Number(body?.price);
  if (!name || !Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a package name and a valid non-negative USD price." }, { status: 400 });
  const data = { name, badgeLabel: cleanTag(body?.badgeLabel), price };
  if (body?.id) {
    const plan = await prisma.membershipPlan.update({ where: { id: body.id }, data });
    return NextResponse.json(plan);
  }
  const id = `plan-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "membership"}-${Date.now()}`;
  const plan = await prisma.membershipPlan.create({ data: { id, ...data, stakingApyBonus: 0, tradingFeeDiscount: 0, hasAccountManager: false, demoAllocation: 25000, maxStakingAssets: 4, maxCopyProviders: 1 } });
  return NextResponse.json(plan, { status: 201 });
}

