import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unreadCount = await prisma.notification.count({
    where: { recipientId: user.id, read: false, dismissedAt: null },
  });
  return NextResponse.json({ unreadCount });
}
