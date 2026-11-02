import { adminAuth } from "@/lib/firebase/admin"; import { missingServerConfig } from "@/lib/config"; import { SESSION_COOKIE } from "@/lib/auth/server"; import { sameOrigin } from "@/lib/auth/csrf"; import { HttpError, readJson } from "@/lib/server/guard"; import { RULES, clientKey, tooMany } from "@/lib/server/limits";
const H = 3600_000, CUSTOMER_MS = 5 * 24 * H, ADMIN_MS = 2 * H; // the owner's session is deliberately short
const same = (req: Request) => sameOrigin({ method: req.method, origin: req.headers.get("origin"), host: new URL(req.url).host, hasBearer: false, secFetchSite: req.headers.get("sec-fetch-site") });
const cookie = (v: string, maxAgeSec: number) => `${SESSION_COOKIE}=${v}; Max-Age=${maxAgeSec}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
/** Exchanges a freshly issued Firebase ID token for an HTTP-only session cookie. Grants no roles. */
export async function POST(req: Request) {
  if (!same(req)) return Response.json({ error: "bad_origin" }, { status: 403 }); // blocks login-CSRF
  const lim = tooMany(req, "session", RULES.session, clientKey(req)); if (lim) return lim;
  if (missingServerConfig().length) return Response.json({ error: "not_configured" }, { status: 503 });
  try {
    const body = await readJson(req, 10_000); const idToken = String(body?.idToken ?? "");
    const t = await adminAuth().verifyIdToken(idToken, true);
    if (Date.now() / 1000 - t.auth_time > 300) return Response.json({ error: "recent_sign_in_required" }, { status: 401 });
    const ms = t.admin === true ? ADMIN_MS : CUSTOMER_MS;
    const res = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    res.headers.append("Set-Cookie", cookie(await adminAuth().createSessionCookie(idToken, { expiresIn: ms }), ms / 1000)); return res;
  } catch (e) { return Response.json({ error: e instanceof HttpError ? e.code : "invalid_token" }, { status: e instanceof HttpError ? e.status : 401 }); }
}
/** Logout: clears the cookie AND revokes the user's refresh tokens, so a copied cookie stops working. This signs the user out on all devices. */
export async function DELETE(req: Request) {
  if (!same(req)) return Response.json({ error: "bad_origin" }, { status: 403 });
  const lim = tooMany(req, "session", RULES.session, clientKey(req)); if (lim) return lim;
  const c = /(?:^|;\s*)__session=([^;]+)/.exec(req.headers.get("cookie") ?? "")?.[1];
  if (c && !missingServerConfig().length) { try { const d = await adminAuth().verifySessionCookie(c, false); await adminAuth().revokeRefreshTokens(d.uid); } catch { /* already invalid */ } }
  const res = Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } }); res.headers.append("Set-Cookie", cookie("", 0)); return res;
}
