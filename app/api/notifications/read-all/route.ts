import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.notification.updateMany({
    where: { recipientId: user.id, read: false, dismissedAt: null },
    data: { read: true, readAt: new Date() },
  });
  return NextResponse.json({ ok: true, updated: result.count });
}
