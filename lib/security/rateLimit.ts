export interface Rule { limit: number; windowMs: number }
/** Fixed-window limiter. In-memory, so it is per server instance (see docs/SECURITY_AUDIT.md). The clock is injectable for tests. */
export function createLimiter(now: () => number = Date.now) {
  const hits = new Map<string, { n: number; reset: number }>();
  return { check(key: string, r: Rule): { ok: boolean; retryAfterSec: number } {
    const t = now(); const e = hits.get(key);
    if (hits.size > 10_000) { for (const [k, v] of hits) if (t >= v.reset) hits.delete(k); if (hits.size > 10_000) hits.clear(); }
    if (!e || t >= e.reset) { hits.set(key, { n: 1, reset: t + r.windowMs }); return { ok: true, retryAfterSec: 0 }; }
    e.n++; return e.n > r.limit ? { ok: false, retryAfterSec: Math.max(1, Math.ceil((e.reset - t) / 1000)) } : { ok: true, retryAfterSec: 0 };
  } };
}
/** First X-Forwarded-For entry, else X-Real-IP. Only trustworthy behind a proxy that overwrites these headers (e.g. Vercel). */
export const clientIp = (xff: string | null, real: string | null) => (xff?.split(",")[0].trim() || real?.trim() || "unknown").slice(0, 64);
