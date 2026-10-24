import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again to view membership plans." }, { status: 401 });

  const [plans, member, account] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.user.findUnique({ where: { id: user.id }, include: { membershipPlan: true } }),
    prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: "LIVE" } } }),
  ]);

  return NextResponse.json({ plans, currentPlan: member?.membershipPlan ?? null, liveBalance: account?.balance ?? 0 });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again to complete your membership payment." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const planId = typeof body?.planId === "string" ? body.planId : "";
  if (!planId) return NextResponse.json({ error: "Choose a membership plan and try again." }, { status: 400 });

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) return NextResponse.json({ error: "That membership plan is no longer available. Refresh the page or contact support for help." }, { status: 404 });

  const account = await prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: "LIVE" } } });
  if (plan.price > 0 && (!account || account.balance - account.marginUsed < plan.price)) {
    return NextResponse.json({ error: "Your Live wallet balance is not enough for this plan. Make a deposit and try again, or contact support if you think this is incorrect." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      if (plan.price > 0 && account) {
        const updatedAccount = await tx.account.updateMany({
          where: { id: account.id, balance: { gte: plan.price + account.marginUsed } },
          data: { balance: { decrement: plan.price }, equity: { decrement: plan.price } },
        });
        if (updatedAccount.count !== 1) throw new Error("LIVE_BALANCE_CHANGED");
        await tx.transaction.create({
          data: { userId: user.id, accountType: "LIVE", type: "MEMBERSHIP_PAYMENT", asset: "USD", amount: -plan.price, amountUsd: -plan.price, status: "COMPLETED", txHash: `plan-${plan.id}-${Date.now()}` },
        });
      }

      await tx.user.update({ where: { id: user.id }, data: { membershipPlanId: plan.id } });
      await tx.account.upsert({
        where: { userId_type: { userId: user.id, type: "DEMO" } },
        update: { balance: plan.demoAllocation, equity: plan.demoAllocation },
        create: { userId: user.id, type: "DEMO", currency: "USD", balance: plan.demoAllocation, equity: plan.demoAllocation },
      });
      await createNotification({
        recipientId: user.id,
        type: notificationTypes.membershipStatusUpdate,
        title: "Membership updated",
        body: `${plan.name} is now active. Your Demo allocation is ${new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(plan.demoAllocation)}.`,
        metadata: { planId: plan.id, href: "/dashboard/plans" },
      }, tx);
    });
  } catch (error) {
    console.error("Membership purchase failed", error);
    return NextResponse.json(
      { error: "We couldn’t activate this plan. Your wallet was not charged. Please try again, or contact support if this keeps happening." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, plan });
}
