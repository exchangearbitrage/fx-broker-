import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createAdminNotifications, notificationTypes } from "@/lib/services/notifications";
import { savePaymentProof } from "@/lib/storage/localStorage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  return NextResponse.json(await prisma.paymentRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    const form = await request.formData();
    const kind = form.get("kind");
    const method = form.get("method");
    const amount = Number(form.get("amount"));
    const planId = form.get("planId")?.toString() || null;
    const asset = form.get("asset")?.toString() || "USD";
    const reference = form.get("reference")?.toString().trim() || "";
    const proof = form.get("proof");
    if (!( ["DEPOSIT", "PLAN"].includes(String(kind)) && typeof method === "string" && amount > 0)) {
      return NextResponse.json({ error: "Please complete the payment details." }, { status: 400 });
    }

    if (kind === "PLAN") {
      const plan = await prisma.membershipPlan.findUnique({ where: { id: planId || "" } });
      if (!plan || plan.price !== amount) return NextResponse.json({ error: "Please choose a valid plan." }, { status: 400 });
    }

    const media = proof instanceof File && proof.size ? await savePaymentProof(proof, user.id) : null;
    const record = await prisma.paymentRequest.create({
      data: { userId: user.id, kind: String(kind), method, asset, amount, planId, reference, proofPath: media?.path, proofName: media?.originalName, proofMime: media?.mimeType },
    });
    await createAdminNotifications({
      actorId: user.id,
      type: notificationTypes.paymentRequestSubmitted,
      title: `New ${kind === "DEPOSIT" ? "deposit" : "membership"} request`,
      body: `${user.firstName || user.email} submitted a ${kind === "DEPOSIT" ? "deposit" : "membership"} payment request for ${amount} ${asset}.`,
      metadata: { paymentRequestId: record.id, userId: user.id, kind, amount, asset, href: "/admin/funding" },
    });

    return NextResponse.json({ ok: true, request: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We couldn’t submit that payment. Please try again." }, { status: 500 });
  }
}
