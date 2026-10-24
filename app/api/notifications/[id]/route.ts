import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await prisma.notification.updateMany({
    where: { id, recipientId: user.id, dismissedAt: null },
    data: { dismissedAt: new Date() },
  });
  if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
