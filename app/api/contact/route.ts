import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactMail } from "@/lib/mail/consoleMailer";
import { contactSchema } from "@/lib/validation/contact";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const message = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  await sendContactMail(parsed.data);

  return NextResponse.json({ ok: true, id: message.id });
}
