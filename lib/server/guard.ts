import "server-only";
import { requireUserApi } from "@/lib/auth/server"; import { sameOrigin } from "@/lib/auth/csrf"; import { missingServerConfig } from "@/lib/config"; import { RULES, clientKey, tooMany } from "./limits";
export class HttpError extends Error { constructor(public status: number, public code: string, public fields?: Record<string, string>) { super(code); } }
export const assertId = (id: string) => { if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new HttpError(404, "not_found"); return id; };
const NOSTORE = { headers: { "Cache-Control": "no-store" } }; // private data must never sit in a shared cache
/** Every customer endpoint: IP throttle, config check, CSRF (mutations), token/session verification, per-user throttle, verified email (mutations). The UID always comes from the verified token. */
export async function withUser(req: Request, write: boolean, fn: (uid: string) => Promise<unknown>): Promise<Response> {
  const ipLimit = tooMany(req, "user-ip", RULES.apiIp, clientKey(req)); if (ipLimit) return ipLimit;
  if (missingServerConfig().length) return Response.json({ error: "not_configured" }, { status: 503 });
  if (write && !sameOrigin({ method: req.method, origin: req.headers.get("origin"), host: new URL(req.url).host, hasBearer: /^Bearer /i.test(req.headers.get("authorization") ?? ""), secFetchSite: req.headers.get("sec-fetch-site") }))
    return Response.json({ error: "bad_origin" }, { status: 403 });
  const g = await requireUserApi(req); if (g instanceof Response) return g;
  const lim = tooMany(req, write ? "user-write" : "user-read", write ? RULES.userWrite : RULES.userRead, g.uid); if (lim) return lim;
  if (write && !g.emailVerified) return Response.json({ error: "email_not_verified" }, { status: 403 });
  try { const out = await fn(g.uid); return out instanceof Response ? out : Response.json(out ?? { ok: true }, NOSTORE); }
  catch (e) { if (e instanceof HttpError) return Response.json({ error: e.code, fields: e.fields }, { status: e.status }); console.error("[account api]", e); return Response.json({ error: "server_error" }, { status: 500 }); }
}
/** Bounded body reader: rejects bodies over 100 KB. Returns null for invalid JSON. */
export async function readJson(req: Request, max = 100_000) {
  const len = Number(req.headers.get("content-length") ?? 0); if (len > max) throw new HttpError(413, "too_large");
  const t = await req.text(); if (t.length > max) throw new HttpError(413, "too_large"); try { return JSON.parse(t); } catch { return null; }
}
