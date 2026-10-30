export interface DecodedLike { uid: string; admin?: unknown }
export type AdminDecision = "ok" | "unauthenticated" | "misconfigured" | "forbidden";
/** Deny by default. Needs the configured UID AND the trusted custom claim `admin === true` set server-side. */
export function evaluateAdmin(decoded: DecodedLike | null, adminUid: string | undefined, serverReady: boolean): AdminDecision {
  if (!serverReady || !adminUid) return "misconfigured";
  if (!decoded) return "unauthenticated";
  if (decoded.uid !== adminUid || decoded.admin !== true) return "forbidden";
  return "ok";
}
export const decisionStatus = (d: AdminDecision) => ({ ok: 200, unauthenticated: 401, forbidden: 403, misconfigured: 503 })[d];
