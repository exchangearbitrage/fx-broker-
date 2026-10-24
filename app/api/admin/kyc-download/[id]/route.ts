import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DownloadProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: DownloadProps) {
  await requireAdmin();
  const { id } = await params;
  const submission = await prisma.kycSubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const file = await readFile(submission.documentPath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": submission.mimeType,
      "Content-Disposition": `${new URL(request.url).searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename="${submission.originalName.replaceAll('"', "")}"`,
    },
  });
}
