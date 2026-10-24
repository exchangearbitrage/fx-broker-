import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getEntitlements } from "@/lib/services/entitlements";
import { stakingVaults } from "@/lib/services/productCatalog";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

const YEAR_SECONDS = 365 * 24 * 60 * 60;
function pendingReward(stake: { principal: number; baseApy: number; bonusApy: number; accrued: number; lastAccruedAt: Date }) { return stake.accrued + stake.principal * ((stake.baseApy + stake.bonusApy) / 100) * Math.max(0, (Date.now() - stake.lastAccruedAt.getTime()) / 1000) / YEAR_SECONDS; }
async function userOr401() { return getCurrentUser(); }

export async function GET() {
  const user = await userOr401(); if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const [entitlements, stakes] = await Promise.all([getEntitlements(user.id), prisma.stakingPosition.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { startedAt: "desc" } })]);
  return NextResponse.json({ entitlements, vaults: stakingVaults.map((vault, index) => ({ ...vault, allowed: index < entitlements.maxStakingAssets })), stakes: stakes.map((stake: { principal: number; baseApy: number; bonusApy: number; accrued: number; lastAccruedAt: Date }) => ({ ...stake, liveAccrued: pendingReward(stake) })) });
}

export async function POST(request: NextRequest) {
  const user = await userOr401(); if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = await request.json().catch(() => null); const vaultId = typeof body?.vaultId === "string" ? body.vaultId : ""; const amountUsd = Number(body?.amountUsd);
  const [entitlements, account] = await Promise.all([getEntitlements(user.id), prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: "LIVE" } } })]);
  const vaultIndex = stakingVaults.findIndex((vault) => vault.id === vaultId); const vault = stakingVaults[vaultIndex];
  if (!vault) return NextResponse.json({ error: "That staking vault is unavailable." }, { status: 404 });
  if (vaultIndex >= entitlements.maxStakingAssets) return NextResponse.json({ error: "This vault requires a paid membership plan. Upgrade to unlock additional staking assets." }, { status: 403 });
  if (!(amountUsd >= vault.minUsd)) return NextResponse.json({ error: `Minimum allocation for ${vault.symbol} is $${vault.minUsd.toLocaleString()}.` }, { status: 400 });
  if (!account || account.balance - account.marginUsed < amountUsd) return NextResponse.json({ error: "Your Live free margin is not enough for this allocation." }, { status: 400 });
  const unlockAt = vault.lockDays ? new Date(Date.now() + vault.lockDays * 24 * 60 * 60 * 1000) : null;
  const stake = await prisma.$transaction(async (tx: any) => {
    await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: amountUsd }, equity: { decrement: amountUsd } } });
    await tx.transaction.create({ data: { userId: user.id, accountType: "LIVE", type: "STAKING_PRINCIPAL", asset: vault.symbol, amount: -amountUsd, amountUsd: -amountUsd, status: "COMPLETED", txHash: `stake-${Date.now()}` } });
    return tx.stakingPosition.create({ data: { userId: user.id, asset: vault.symbol, principal: amountUsd, baseApy: vault.apy, bonusApy: entitlements.stakingApyBonus, lockDays: vault.lockDays, unlockAt } });
  });
  return NextResponse.json({ ok: true, stake }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await userOr401(); if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id, action } = await request.json().catch(() => ({})); const stake = await prisma.stakingPosition.findFirst({ where: { id, userId: user.id, status: "ACTIVE" } });
  if (!stake) return NextResponse.json({ error: "This staking position is unavailable." }, { status: 404 });
  const reward = pendingReward(stake); const account = await prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: "LIVE" } } }); if (!account) return NextResponse.json({ error: "Live account unavailable." }, { status: 400 });
  if (action === "CLAIM") { if (reward <= 0) return NextResponse.json({ error: "No reward is available to claim yet." }, { status: 400 }); await prisma.$transaction(async (tx: any) => { await tx.stakingPosition.update({ where: { id }, data: { accrued: 0, lastAccruedAt: new Date() } }); await tx.account.update({ where: { id: account.id }, data: { balance: { increment: reward }, equity: { increment: reward } } }); await tx.transaction.create({ data: { userId: user.id, accountType: "LIVE", type: "STAKING_REWARD", asset: stake.asset, amount: reward, amountUsd: reward, status: "COMPLETED", txHash: `reward-${id}-${Date.now()}` } }); }); return NextResponse.json({ ok: true, reward }); }
  if (action === "UNSTAKE") { if (stake.unlockAt && stake.unlockAt.getTime() > Date.now()) return NextResponse.json({ error: `This position is locked until ${stake.unlockAt.toISOString().slice(0, 10)}.` }, { status: 400 }); const payout = stake.principal + reward; await prisma.$transaction(async (tx: any) => { await tx.stakingPosition.update({ where: { id }, data: { status: "CLOSED", accrued: 0, lastAccruedAt: new Date() } }); await tx.account.update({ where: { id: account.id }, data: { balance: { increment: payout }, equity: { increment: payout } } }); await tx.transaction.create({ data: { userId: user.id, accountType: "LIVE", type: "STAKING_UNSTAKE", asset: stake.asset, amount: payout, amountUsd: payout, status: "COMPLETED", txHash: `unstake-${id}-${Date.now()}` } }); await createNotification({ recipientId: user.id, type: notificationTypes.stakingRewardClaimed, title: "Staking position closed", body: `$${payout.toFixed(2)} was returned to your Live account.`, metadata: { href: "/dashboard/earn" } }, tx); }); return NextResponse.json({ ok: true, payout }); }
  return NextResponse.json({ error: "That staking action is unavailable." }, { status: 400 });
}