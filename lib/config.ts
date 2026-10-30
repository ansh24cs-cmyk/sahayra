/** Reports missing variable NAMES only. Never returns values. Client vars must be referenced statically to be inlined. */
export function missingPublicConfig(): string[] {
  const v: Record<string, string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID };
  return Object.keys(v).filter((k) => !v[k]);
}
export const SERVER_KEYS = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY", "ADMIN_UID"] as const;
export const missingServerConfig = () => SERVER_KEYS.filter((k) => !process.env[k]);
