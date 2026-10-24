import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";


export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ locale: user?.preferredLanguage ?? "en" });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { locale } = await request.json().catch(() => ({}));
  const safeLocale = typeof locale === "string" && locale.length <= 10 ? locale : "en";
  await prisma.user.update({ where: { id: user.id }, data: { preferredLanguage: safeLocale } });
  return NextResponse.json({ locale: safeLocale });
}
