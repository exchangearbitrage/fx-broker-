import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const HUMAN_CHALLENGE_COOKIE = "pb_human_challenge";

type ChallengePayload = {
  answer: number;
  expiresAt: number;
  nonce: string;
};

function secret() {
  const value =
    process.env.HUMAN_CHALLENGE_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.DATABASE_URL ??
    (process.env.NODE_ENV !== "production" ? "arbitex-dev-challenge-fallback-secret-2026" : undefined);
  if (!value) throw new Error("Human challenge secret is not configured");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createHumanChallenge(answer: number) {
  const payload = Buffer.from(JSON.stringify({
    answer,
    expiresAt: Date.now() + 10 * 60 * 1000,
    nonce: randomBytes(16).toString("base64url"),
  } satisfies ChallengePayload)).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyHumanChallenge(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ChallengePayload;
    if (!Number.isInteger(parsed.answer) || !Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= Date.now() || !parsed.nonce) return null;
    return parsed;
  } catch {
    return null;
  }
}
