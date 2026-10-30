import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { missingServerConfig } from "@/lib/config";
import { decisionStatus, evaluateAdmin, type AdminDecision } from "./adminPolicy";
export const SESSION_COOKIE = "__session";
async function decode(req?: Request) {
  if (missingServerConfig().length) return null;
  try {
    const auth = adminAuth(); const bearer = req?.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    if (bearer) return await auth.verifyIdToken(bearer, true);
    const c = (await cookies()).get(SESSION_COOKIE)?.value;
    return c ? await auth.verifySessionCookie(c, true) : null;
  } catch { return null; }
}
export async function getAdminDecision(req?: Request): Promise<{ decision: AdminDecision; uid?: string }> {
  const d = await decode(req);
  const decision = evaluateAdmin(d, process.env.ADMIN_UID, missingServerConfig().length === 0);
  return { decision, uid: decision === "ok" ? d!.uid : undefined };
}
/** For route handlers: `const g = await requireAdminApi(req); if (g instanceof Response) return g;` */
export async function requireAdminApi(req: Request): Promise<{ uid: string } | Response> {
  const { decision, uid } = await getAdminDecision(req);
  return decision === "ok" ? { uid: uid! } : Response.json({ error: decision }, { status: decisionStatus(decision) });
}
/** Customer-owned resources: authenticated AND uid === resource owner. */
export async function requireUserApi(req: Request, ownerUid?: string): Promise<{ uid: string } | Response> {
  const d = await decode(req);
  if (!d) return Response.json({ error: "unauthenticated" }, { status: 401 });
  if (ownerUid && d.uid !== ownerUid) return Response.json({ error: "forbidden" }, { status: 403 });
  return { uid: d.uid };
}
