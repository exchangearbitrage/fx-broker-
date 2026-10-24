import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toNotificationResponse, type NotificationRecord } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  let keepAlive: ReturnType<typeof setInterval> | undefined;
  let stopped = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let since = new Date();
      const send = async () => {
        if (stopped) return;
        try {
          const notifications = await prisma.notification.findMany({
            where: { recipientId: user.id, dismissedAt: null, createdAt: { gt: since } },
            orderBy: { createdAt: "asc" },
            include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
          });
          for (const notification of notifications) {
            since = notification.createdAt;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "NEW_NOTIFICATION",
              notification: toNotificationResponse(notification as NotificationRecord),
            })}\n\n`));
          }
        } catch {
          // A disconnected client can fall back to its regular notification fetch.
        }
      };

      interval = setInterval(() => void send(), 1_250);
      keepAlive = setInterval(() => {
        if (!stopped) controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15_000);
    },
    cancel() {
      stopped = true;
      if (interval) clearInterval(interval);
      if (keepAlive) clearInterval(keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
