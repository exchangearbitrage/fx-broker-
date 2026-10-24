import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toNotificationResponse, type NotificationRecord } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id, recipientId: user.id, dismissedAt: null },
    include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });
  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

  const updated = notification.read
    ? notification
    : await prisma.notification.update({
        where: { id: notification.id },
        data: { read: true, readAt: new Date() },
        include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
      });

  return NextResponse.json({ ok: true, notification: toNotificationResponse(updated as NotificationRecord) });
}
