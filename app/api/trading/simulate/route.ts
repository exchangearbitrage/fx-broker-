import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { estimatedFee, tradePnl } from "@/lib/services/ledger";

function validAccountType(value: unknown): "LIVE" | "DEMO" | null { return value === "LIVE" || value === "DEMO" ? value : null; }

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = await request.json();
  const accountType = validAccountType(body.accountType ?? "DEMO");
  if (!accountType) return NextResponse.json({ error: "Invalid account mode." }, { status: 400 });

  if (body.action === "OPEN") {
    const size = Number(body.size), entryPrice = Number(body.entryPrice), leverage = Number(body.leverage || 1);
    if (!body.symbol || !["BUY", "SELL"].includes(body.side) || !(size > 0) || !(entryPrice > 0) || !(leverage >= 1)) return NextResponse.json({ error: "Please check your trade details." }, { status: 400 });
    const account = await prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: accountType } } });
    if (!account) return NextResponse.json({ error: "Your trading account is unavailable." }, { status: 400 });
    const member = await prisma.user.findUnique({ where: { id: user.id }, include: { membershipPlan: true } });
    const notional = size * entryPrice, margin = notional / leverage, fee = estimatedFee(notional, member?.membershipPlan?.tradingFeeDiscount || 0);
    if (account.balance - account.marginUsed < margin + fee) return NextResponse.json({ error: "You do not have enough available margin for this trade." }, { status: 400 });
    const position = await prisma.$transaction(async (tx: any) => {
      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: fee }, equity: { decrement: fee }, marginUsed: { increment: margin } } });
      await tx.transaction.create({ data: { userId: user.id, accountType, type: "TRADE_FEE", asset: "USD", amount: fee, amountUsd: fee, status: "COMPLETED", txHash: `fee-${Date.now()}` } });
      return tx.position.create({ data: { userId: user.id, accountType, symbol: body.symbol, side: body.side, size, leverage, entryPrice, markPrice: entryPrice, margin, pnl: 0 } });
    });
    return NextResponse.json({ ok: true, position });
  }

  if (body.action === "MARK" || body.action === "CLOSE") {
    const position = await prisma.position.findFirst({ where: { id: body.id, userId: user.id, accountType, status: "OPEN" } });
    if (!position || !(Number(body.markPrice) > 0)) return NextResponse.json({ error: "This position is unavailable." }, { status: 404 });
    const pnl = tradePnl(position.side, position.size, position.entryPrice, Number(body.markPrice));
    if (body.action === "MARK") { await prisma.position.update({ where: { id: position.id }, data: { markPrice: Number(body.markPrice), pnl } }); return NextResponse.json({ ok: true, pnl }); }
    await prisma.$transaction(async (tx: any) => {
      const account = await tx.account.findUnique({ where: { userId_type: { userId: user.id, type: accountType } } });
      if (!account) throw new Error("Trading account unavailable");
      await tx.position.update({ where: { id: position.id }, data: { status: "CLOSED", markPrice: Number(body.markPrice), pnl, closedAt: new Date() } });
      await tx.account.update({ where: { id: account.id }, data: { balance: { increment: pnl }, equity: { increment: pnl }, marginUsed: { decrement: position.margin } } });
      await tx.transaction.create({ data: { userId: user.id, accountType, type: "TRADE_PNL", asset: "USD", amount: pnl, amountUsd: pnl, status: "COMPLETED", txHash: `close-${position.id}` } });
    });
    return NextResponse.json({ ok: true, pnl });
  }
  return NextResponse.json({ error: "That trading action is unavailable." }, { status: 400 });
}