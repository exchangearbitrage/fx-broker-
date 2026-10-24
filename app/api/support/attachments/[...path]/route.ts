import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const user = await requireUser();
  const { path } = await params;
  const messageId = path[0];
  if (!messageId || path.length !== 1) {
    return NextResponse.json({ error: "File unavailable." }, { status: 404 });
  }

  const message = await prisma.supportMessage.findUnique({
    where: { id: messageId },
    include: { ticket: true },
  });
  if (!message?.attachmentPath || (user.role !== "ADMIN" && message.ticket.userId !== user.id)) {
    return NextResponse.json({ error: "File unavailable." }, { status: 404 });
  }

  try {
    const inline = new URL(request.url).searchParams.get("inline") === "1";
    const safeName = (message.attachmentName ?? "attachment").replaceAll('"', "");
    return new NextResponse(await readFile(message.attachmentPath), {
      headers: {
        "Content-Type": message.attachmentType ?? "application/octet-stream",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable." }, { status: 404 });
  }
}
