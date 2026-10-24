import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: string; note?: string } | null;
  const status = body?.status;
  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }

  try {
    const requestRecord = await prisma.$transaction(async (tx: any) => {
      const item = await tx.paymentRequest.findUnique({ where: { id } });
      if (!item || item.status !== "PENDING") throw new Error("unavailable");

      const reviewed = await tx.paymentRequest.update({
        where: { id: item.id },
        data: { status, reviewNote: String(body?.note || ""), reviewedById: admin.id, reviewedAt: new Date() },
      });

      if (status === "APPROVED" && item.kind === "DEPOSIT") {
        await tx.account.upsert({
          where: { userId_type: { userId: item.userId, type: "LIVE" } },
          update: { balance: { increment: item.amount }, equity: { increment: item.amount } },
          create: { userId: item.userId, type: "LIVE", currency: "USD", balance: item.amount, equity: item.amount },
        });
        await tx.transaction.create({
          data: { userId: item.userId, accountType: "LIVE", type: "DEPOSIT", asset: item.asset, amount: item.amount, amountUsd: item.amount, txHash: item.reference || null, status: "COMPLETED" },
        });
      }

      if (status === "APPROVED" && item.kind === "PLAN" && item.planId) {
        const plan = await tx.membershipPlan.findUnique({ where: { id: item.planId } });
        await tx.user.update({ where: { id: item.userId }, data: { membershipPlanId: item.planId } });
        if (plan) {
          await tx.account.upsert({
            where: { userId_type: { userId: item.userId, type: "DEMO" } },
            update: { balance: plan.demoAllocation, equity: plan.demoAllocation },
            create: { userId: item.userId, type: "DEMO", currency: "USD", balance: plan.demoAllocation, equity: plan.demoAllocation },
          });
        }
      }

      const isDeposit = item.kind === "DEPOSIT";
      const type = isDeposit ? notificationTypes.depositStatusUpdate : notificationTypes.membershipStatusUpdate;
      const subject = isDeposit ? "Deposit" : "Membership payment";
      const amount = item.asset === "USD"
        ? new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(item.amount)
        : `${item.amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${item.asset}`;
      await createNotification({
        recipientId: item.userId,
        actorId: admin.id,
        type,
        title: `${subject} ${status.toLowerCase()}`,
        body: status === "APPROVED"
          ? `${subject} of ${amount} has been approved.${isDeposit ? " Your Live balance is now updated." : " Your plan benefits are now active."}`
          : `${subject} of ${amount} was not approved.${body?.note ? " Review the note and submit an updated request." : ""}`,
        metadata: {
          paymentRequestId: item.id,
          kind: item.kind,
          status,
          amount: item.amount,
          asset: item.asset,
          planId: item.planId,
          href: isDeposit ? "/dashboard/portfolio?tab=funding" : "/dashboard/plans",
        },
      }, tx);

      return reviewed;
    });

    return NextResponse.json({ ok: true, request: requestRecord });
  } catch {
    return NextResponse.json({ error: "This request has already been processed or is unavailable." }, { status: 409 });
  }
}
