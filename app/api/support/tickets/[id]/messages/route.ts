import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { supportMessageSchema } from "@/lib/validation/support";
import { createAdminNotifications, createNotification, notificationTypes } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

type MessageProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: MessageProps) {
  const user = await requireUser();
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket || (ticket.userId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "This support thread is unavailable." }, { status: 404 });
  }

  const parsed = supportMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Write a message or add a valid attachment." },
      { status: 400 },
    );
  }

  const upload = parsed.data.attachmentId
    ? await prisma.supportUpload.findFirst({
        where: { id: parsed.data.attachmentId, userId: user.id, consumedAt: null },
      })
    : null;
  if (parsed.data.attachmentId && !upload) {
    return NextResponse.json({ error: "This attachment is unavailable." }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient & { supportUpload: typeof prisma.supportUpload }) => {
    const message = await tx.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        body: parsed.data.message.trim(),
        attachmentPath: upload?.storagePath ?? null,
        attachmentName: upload?.originalName ?? null,
        attachmentType: upload?.mimeType ?? null,
        attachmentSize: upload?.size ?? null,
      },
    });
    if (upload) {
      await tx.supportUpload.update({ where: { id: upload.id }, data: { consumedAt: new Date() } });
    }
    return message;
  });

  const message = upload
    ? await prisma.supportMessage.update({
        where: { id: created.id },
        data: { attachmentUrl: `/api/support/attachments/${created.id}` },
      })
    : created;

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { updatedAt: new Date() },
  });

  if (user.role === "ADMIN") {
    await createNotification({
      recipientId: ticket.userId,
      actorId: user.id,
      type: notificationTypes.newMessage,
      title: "New support reply",
      body: parsed.data.message.trim() || "Support shared an attachment with you.",
      metadata: { ticketId: ticket.id, messageId: message.id, href: "/dashboard" },
    });
  } else {
    await createAdminNotifications({
      actorId: user.id,
      type: notificationTypes.newMessage,
      title: "New support message",
      body: `${user.firstName || user.email} replied in “${ticket.subject}”.`,
      metadata: { ticketId: ticket.id, messageId: message.id, userId: user.id, href: "/admin/support" },
    });
  }

  return NextResponse.json({ ok: true, message });
}
