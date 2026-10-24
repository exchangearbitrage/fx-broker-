import { prisma } from "@/lib/db";

type AccountType = "LIVE" | "DEMO";

export async function accountSnapshot(userId: string, accountType?: AccountType) {
  const [accounts, positions] = await Promise.all([
    prisma.account.findMany({ where: accountType ? { userId, type: accountType } : { userId } }),
    prisma.position.findMany({ where: accountType ? { userId, accountType, status: "OPEN" } : { userId, status: "OPEN" } }),
  ]);
  return accounts.map((account: any) => {
    const unrealizedPnl = positions.filter((position: any) => position.accountType === account.type).reduce((total: number, position: any) => total + position.pnl, 0);
    const equity = account.balance + unrealizedPnl;
    return { ...account, equity, unrealizedPnl, freeMargin: Math.max(0, equity - account.marginUsed), marginLevel: account.marginUsed ? (equity / account.marginUsed) * 100 : null };
  });
}

export function tradePnl(side: string, size: number, entry: number, mark: number) { return (side === "BUY" ? mark - entry : entry - mark) * size; }
export function estimatedFee(notional: number, discount = 0) { return Math.max(0, notional * 0.001 * (1 - discount / 100)); }