import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveSupportAttachment } from "@/lib/storage/localStorage";

export const dynamic = "force-dynamic";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
]);
const maximumFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !allowedMimeTypes.has(file.type) || file.size > maximumFileSize) {
      return NextResponse.json(
        { error: "Choose an image, PDF, Word document, or text file under 10 MB." },
        { status: 400 },
      );
    }

    const stored = await saveSupportAttachment(file, user.id);
    const upload = await prisma.supportUpload.create({
      data: {
        userId: user.id,
        storagePath: stored.path,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        size: file.size,
      },
    });
    return NextResponse.json({
      ok: true,
      attachmentId: upload.id,
      name: upload.originalName,
      type: upload.mimeType,
      size: upload.size,
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn’t upload that file. Please try again." },
      { status: 500 },
    );
  }
}
