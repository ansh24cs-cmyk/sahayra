import "server-only";
import { createLimiter, clientIp, type Rule } from "@/lib/security/rateLimit";
const limiter = createLimiter();
export const RULES = { apiIp: { limit: 240, windowMs: 60_000 }, userRead: { limit: 120, windowMs: 60_000 }, userWrite: { limit: 30, windowMs: 60_000 }, adminIp: { limit: 120, windowMs: 60_000 }, adminRead: { limit: 240, windowMs: 60_000 }, adminWrite: { limit: 120, windowMs: 60_000 },
  session: { limit: 10, windowMs: 600_000 }, contact: { limit: 5, windowMs: 3_600_000 }, publicRead: { limit: 120, windowMs: 60_000 } } satisfies Record<string, Rule>;
export const clientKey = (req: Request) => clientIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip"));
export function tooMany(req: Request, name: string, rule: Rule, id: string): Response | null {
  const r = limiter.check(`${name}:${id}`, rule); return r.ok ? null : Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(r.retryAfterSec) } });
}
