import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin"; import { getAdminDecision } from "@/lib/auth/server"; import { decisionStatus } from "@/lib/auth/adminPolicy"; import { sameOrigin } from "@/lib/auth/csrf"; import { missingServerConfig } from "@/lib/config";
import { HttpError, assertId, readJson } from "./guard"; import { RULES, clientKey, tooMany } from "./limits"; import type { V } from "@/lib/admin/validation";
async function audit(req: Request, e: { uid?: string; event: string; decision?: string }) {
  await adminDb().collection("auditLog").add({ ...e, method: req.method, path: new URL(req.url).pathname, ip: clientKey(req), at: FieldValue.serverTimestamp() }).catch((err) => console.error("[audit] FAILED to write audit entry", err));
}
/** Every admin endpoint: IP throttle, config check, CSRF on writes, token/session verification, UID + admin claim (deny by default), per-admin throttle, no-store, and audit entries for writes and for authenticated-but-forbidden attempts. */
export async function withAdmin(req: Request, write: boolean, fn: (uid: string) => Promise<unknown>): Promise<Response> {
  const ipLimit = tooMany(req, "admin-ip", RULES.adminIp, clientKey(req)); if (ipLimit) return ipLimit;
  if (missingServerConfig().length) return Response.json({ error: "not_configured" }, { status: 503 });
  if (write && !sameOrigin({ method: req.method, origin: req.headers.get("origin"), host: new URL(req.url).host, hasBearer: /^Bearer /i.test(req.headers.get("authorization") ?? ""), secFetchSite: req.headers.get("sec-fetch-site") })) return Response.json({ error: "bad_origin" }, { status: 403 });
  const { decision, uid, actor } = await getAdminDecision(req);
  if (decision !== "ok") { if (decision === "forbidden") await audit(req, { uid: actor, event: "admin_access_denied", decision }); return Response.json({ error: decision }, { status: decisionStatus(decision) }); }
  const lim = tooMany(req, "admin-uid", write ? RULES.adminWrite : RULES.adminRead, uid!); if (lim) return lim;
  try {
    const out = await fn(uid!); if (write) await audit(req, { uid, event: "admin_write" });
    return out instanceof Response ? out : Response.json(out ?? { ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { if (e instanceof HttpError) return Response.json({ error: e.code, fields: e.fields }, { status: e.status }); console.error("[admin api]", e); return Response.json({ error: "server_error" }, { status: 500 }); }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ser = (o: Record<string, any>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v?.toDate === "function" ? v.toDate().toISOString() : v]));
/** Generic list/create/update/delete for simple collections. Values come only from the validator's allow-list. */
export function collectionHandlers<T extends object>(o: { name: string; validate: (i: unknown) => V<T>; idField?: string; orderBy?: [string, "asc" | "desc"]; beforeDelete?: (id: string) => Promise<void> }) {
  const col = () => adminDb().collection(o.name); const ts = () => FieldValue.serverTimestamp(); const [ob, dir] = o.orderBy ?? ["createdAt", "desc"];
  const val = async (req: Request) => { const v = o.validate(await readJson(req)); if (!v.ok) throw new HttpError(400, "validation", v.errors); return v.value as Record<string, unknown>; };
  return {
    list: (req: Request) => withAdmin(req, false, async () => ({ items: (await col().orderBy(ob, dir).limit(200).get()).docs.map((d) => ({ id: d.id, ...ser(d.data()) })) })),
    create: (req: Request) => withAdmin(req, true, async () => { const v = await val(req); const ref = o.idField ? col().doc(String(v[o.idField])) : col().doc();
      try { await ref.create({ ...v, createdAt: ts(), updatedAt: ts() }); } catch (e) { if ((e as { code?: number }).code === 6) throw new HttpError(409, "already_exists", { [o.idField ?? "id"]: "This already exists." }); throw e; } return { id: ref.id }; }),
    update: (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, async () => { const id = assertId(params.id); const v = await val(req); if (o.idField) v[o.idField] = id;
      const ref = col().doc(id); if (!(await ref.get()).exists) throw new HttpError(404, "not_found"); await ref.update({ ...v, updatedAt: ts() }); }),
    remove: (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, async () => { const id = assertId(params.id); await o.beforeDelete?.(id); await col().doc(id).delete(); }),
  };
}
