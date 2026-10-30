export type AuthStatus = "initialising" | "signed-out" | "signed-in" | "verification-required" | "unconfigured" | "error";
/** Display-only. Never use any value here for authorisation; the server decides who is an admin. */
export interface AuthUser { uid: string; email: string | null; displayName: string | null; emailVerified: boolean }
