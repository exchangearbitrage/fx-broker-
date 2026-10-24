import { NextResponse } from "next/server";
import { createHumanChallenge, HUMAN_CHALLENGE_COOKIE } from "@/lib/auth/human-challenge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const left = 6 + Math.floor(Math.random() * 14);
    const right = 2 + Math.floor(Math.random() * 9);
    const useAddition = Math.random() >= 0.5;
    const minuend = useAddition ? left : Math.max(left, right);
    const subtrahend = useAddition ? right : Math.min(left, right);
    const answer = useAddition ? left + right : minuend - subtrahend;
    const token = createHumanChallenge(answer);
    const response = NextResponse.json({
      id: token,
      question: useAddition ? `${left} + ${right}` : `${minuend} − ${subtrahend}`,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });

    response.cookies.set(HUMAN_CHALLENGE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Human verification is temporarily unavailable. Please try again, or contact support if this continues." }, {
      status: 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
