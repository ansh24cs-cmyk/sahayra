import { adminAuth } from "@/lib/firebase/admin";
import { missingServerConfig } from "@/lib/config";
import { SESSION_COOKIE } from "@/lib/auth/server";
const FIVE_DAYS = 60 * 60 * 24 * 5 * 1000;
/** Exchanges a freshly issued Firebase ID token for an HTTP-only session cookie. Grants no roles. */
export async function POST(req: Request) {
  if (missingServerConfig().length) return Response.json({ error: "not_configured" }, { status: 503 });
  try {
    const { idToken } = await req.json();
    const t = await adminAuth().verifyIdToken(String(idToken), true);
    if (Date.now() / 1000 - t.auth_time > 300) return Response.json({ error: "recent_sign_in_required" }, { status: 401 });
    const cookie = await adminAuth().createSessionCookie(String(idToken), { expiresIn: FIVE_DAYS });
    const res = Response.json({ ok: true });
    res.headers.append("Set-Cookie", `${SESSION_COOKIE}=${cookie}; Max-Age=${FIVE_DAYS / 1000}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return res;
  } catch { return Response.json({ error: "invalid_token" }, { status: 401 }); }
}
export async function DELETE() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
  return res;
}
