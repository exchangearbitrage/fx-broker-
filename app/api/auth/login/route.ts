import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || user.status !== "ACTIVE" || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
      return NextResponse.json({ ok: false, errors: { email: ["Invalid email or password."] } }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ ok: true, role: user.role });
  } catch {
    return NextResponse.json({ ok: false, errors: { form: ["We can’t sign you in right now. Please try again shortly, or contact support if this continues."] } }, { status: 503 });
  }
}
