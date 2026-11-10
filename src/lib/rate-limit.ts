import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db";

function hashIdentifier(identifier: string) {
  const secret =
    process.env.RATE_LIMIT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "local-development-only";
  return createHmac("sha256", secret).update(identifier).digest("hex");
}

export async function enforceRateLimit(options: {
  action: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}) {
  const now = new Date();
  const windowMs = options.windowSeconds * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const expiresAt = new Date(windowStart.getTime() + windowMs * 2);
  const key = hashIdentifier(options.identifier);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key_action_windowStart: { key, action: options.action, windowStart } },
    update: { count: { increment: 1 }, expiresAt },
    create: { key, action: options.action, windowStart, expiresAt, count: 1 }
  });

  if (bucket.count > options.limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000)
    );
    return { allowed: false as const, retryAfter };
  }

  return { allowed: true as const, remaining: options.limit - bucket.count };
}
