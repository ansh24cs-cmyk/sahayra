import { FieldValue } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin"; import { sameOrigin } from "@/lib/auth/csrf"; import { missingServerConfig } from "@/lib/config"; import { validateContact } from "@/lib/content/contact";
import { HttpError, readJson } from "@/lib/server/guard"; import { RULES, clientKey, tooMany } from "@/lib/server/limits";
export async function POST(req: Request) {
  if (!sameOrigin({ method: "POST", origin: req.headers.get("origin"), host: new URL(req.url).host, hasBearer: false, secFetchSite: req.headers.get("sec-fetch-site") })) return Response.json({ error: "bad_origin" }, { status: 403 });
  const lim = tooMany(req, "contact", RULES.contact, clientKey(req)); if (lim) return lim;
  let body; try { body = await readJson(req, 10_000); } catch (e) { return Response.json({ error: e instanceof HttpError ? e.code : "bad_request" }, { status: e instanceof HttpError ? e.status : 400 }); }
  const v = validateContact(body); if (!v.ok) return Response.json({ error: "validation", fields: v.errors }, { status: 400 });
  if (v.spam) return Response.json({ ok: true }); // honeypot: pretend success, store nothing
  if (missingServerConfig().length) return Response.json({ error: "not_configured" }, { status: 503 });
  try { await adminDb().collection("messages").add({ ...v.value, createdAt: FieldValue.serverTimestamp() }); return Response.json({ ok: true }); } catch (e) { console.error("[contact]", e); return Response.json({ error: "server_error" }, { status: 500 }); }
}
