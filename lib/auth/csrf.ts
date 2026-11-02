/** CSRF defence for cookie-authenticated mutations. Bearer-token requests carry no ambient credentials, so they pass. */
export function sameOrigin(r: { method: string; origin: string | null; host: string; hasBearer: boolean; secFetchSite: string | null }): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(r.method.toUpperCase())) return true;
  if (r.hasBearer) return true;
  if (r.origin) { try { return new URL(r.origin).host === r.host; } catch { return false; } }
  return r.secFetchSite === "same-origin";
}
