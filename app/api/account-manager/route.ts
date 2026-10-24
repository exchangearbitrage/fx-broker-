import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createAdminNotifications, createNotification, notificationTypes } from "@/lib/services/notifications";

export async function GET(request: NextRequest) {
  const viewer = await getCurrentUser();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = viewer.role === "ADMIN" ? new URL(request.url).searchParams.get("userId") : viewer.id;
  if (!userId) return NextResponse.json({ error: "Missing user" }, { status: 400 });
  return NextResponse.json(await prisma.accountManagerMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 100 }));
}

export async function POST(request: NextRequest) {
  const viewer = await getCurrentUser();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { body, userId } = await request.json();
  const target = viewer.role === "ADMIN" ? userId : viewer.id;
  if (!target || typeof body !== "string" || !body.trim()) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  const message = await prisma.accountManagerMessage.create({
    data: { userId: target, body: body.trim().slice(0, 4000), senderRole: viewer.role === "ADMIN" ? "ADMIN" : "USER" },
  });

  if (viewer.role === "ADMIN") {
    await createNotification({
      recipientId: target,
      actorId: viewer.id,
      type: notificationTypes.accountManagerMessage,
      title: "New message from your account manager",
      body: message.body,
      metadata: { messageId: message.id, href: "/dashboard" },
    });
  } else {
    await createAdminNotifications({
      actorId: viewer.id,
      type: notificationTypes.accountManagerMessage,
      title: "New account manager message",
      body: `${viewer.firstName || viewer.email} sent a message.`,
      metadata: { userId: viewer.id, messageId: message.id, href: "/admin/account-manager" },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
