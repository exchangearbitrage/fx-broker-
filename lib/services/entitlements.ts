import { prisma } from "@/lib/db";

export type Entitlements = { planId: string; planName: string; isPaid: boolean; maxStakingAssets: number; maxCopyProviders: number; stakingApyBonus: number };
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { membershipPlan: true } });
  const plan = user?.membershipPlan;
  return { planId: plan?.id ?? "plan-standard", planName: plan?.name ?? "Standard", isPaid: Boolean(plan && plan.price > 0), maxStakingAssets: plan?.maxStakingAssets ?? 4, maxCopyProviders: plan?.maxCopyProviders ?? 1, stakingApyBonus: plan?.stakingApyBonus ?? 0 };
}