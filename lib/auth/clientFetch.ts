import { getClientAuth } from "@/lib/firebase/client";
export class ApiError extends Error { constructor(public status: number, public code: string, public fields?: Record<string, string>) { super(code); } }
/** Browser helper: attaches the user's fresh ID token. The server derives the UID from it, never from the request body. */
export async function authedFetch<T>(path: string, init: Omit<RequestInit, "body"> & { json?: unknown } = {}): Promise<T> {
  const token = await getClientAuth()?.currentUser?.getIdToken(); if (!token) throw new ApiError(401, "unauthenticated");
  const { json, ...rest } = init;
  const r = await fetch(path, { ...rest, headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}` }, body: json !== undefined ? JSON.stringify(json) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, data.error ?? "request_failed", data.fields);
  return data as T;
}
export function apiMessage(e: unknown): string {
  const c = (e as ApiError)?.code;
  return c === "not_configured" ? "The server isn't connected to Firebase yet." : c === "email_not_verified" ? "Please verify your email first." : c === "address_limit" ? "You can save up to 10 addresses." : c === "unauthenticated" ? "Please sign in again." : "Something went wrong. Please try again.";
}
