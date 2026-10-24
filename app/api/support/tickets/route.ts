import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { supportTicketSchema } from "@/lib/validation/support";
import { createAdminNotifications, notificationTypes } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireUser();
  const where = user.role === "ADMIN" ? {} : { userId: user.id };
  const url = new URL(request.url);
  const ticketId = url.searchParams.get("ticketId");
  const before = url.searchParams.get("before");
  const requestedLimit = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

  if (ticketId) {
    const ticket = await prisma.supportTicket.findFirst({ where: { ...where, id: ticketId } });
    if (!ticket) return NextResponse.json({ error: "This support thread is unavailable." }, { status: 404 });

    const newestFirst = await prisma.supportMessage.findMany({
      where: { ticketId, ...(before ? { createdAt: { lt: new Date(before) } } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
    });
    const messages = newestFirst.reverse();
    return NextResponse.json({ ticket, messages, hasMore: newestFirst.length === limit });
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      },
      user: true,
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = supportTicketSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: parsed.data.subject,
      messages: {
        create: {
          senderId: user.id,
          body: parsed.data.message,
        },
      },
    },
    include: { messages: true },
  });

  await createAdminNotifications({
    actorId: user.id,
    type: notificationTypes.newMessage,
    title: "New support conversation",
    body: `${user.firstName || user.email} opened “${ticket.subject}”.`,
    metadata: { ticketId: ticket.id, userId: user.id, href: "/admin/support" },
  });

  return NextResponse.json({ ok: true, ticket });
}
