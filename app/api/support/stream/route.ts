import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireUser();
  const ticketId = new URL(request.url).searchParams.get("ticketId");
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
          const messages = await prisma.supportMessage.findMany({
            where: {
              ...(ticketId ? { ticketId } : {}),
              createdAt: { gt: since },
              ...(user.role === "ADMIN" ? {} : { ticket: { userId: user.id } }),
            },
            orderBy: { createdAt: "asc" },
            include: {
              sender: { select: { id: true, firstName: true, lastName: true, role: true } },
            },
          });

          for (const message of messages) {
            since = message.createdAt;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "NEW_MESSAGE", message })}\n\n`),
            );
          }
        } catch {
          // The client falls back to polling if the stream is interrupted.
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
