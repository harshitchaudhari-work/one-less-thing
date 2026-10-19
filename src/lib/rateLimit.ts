import "server-only";

/**
 * Small in-memory sliding-window limiter, per key (here: the visitor's IP).
 * On Vercel each server instance keeps its own memory, so this stops bursts
 * and casual abuse rather than being a hard global cap. For a strict limit,
 * back it with a shared store such as Upstash Redis.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep memory bounded: drop idle keys now and then.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (now - times[times.length - 1] >= windowMs) hits.delete(k);
  }
  return { ok: true as const };
}

export function clientIp(request: Request) {
  // Vercel sets x-forwarded-for; the first entry is the visitor.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
