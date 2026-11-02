import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signOut, updateProfile,
  browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
export class AuthNotConfiguredError extends Error { constructor() { super("Firebase is not configured."); } }
const auth = () => { const a = getClientAuth(); if (!a) throw new AuthNotConfiguredError(); return a; };
export function mapAuthError(e: unknown): string {
  if (e instanceof AuthNotConfiguredError) return "Sign-in isn't connected yet. See docs/AUTH_SETUP.md.";
  switch ((e as { code?: string })?.code) {
    case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found": return "The email or password is incorrect.";
    case "auth/requires-recent-login": return "Please sign in again, then retry.";
    case "auth/user-disabled": return "This account has been disabled. Contact support.";
    case "auth/network-request-failed": return "Network problem. Check your connection and try again.";
    case "auth/too-many-requests": return "Too many attempts. Wait a few minutes and try again.";
    case "auth/email-already-in-use": return "An account with this email already exists. Try signing in.";
    case "auth/weak-password": return "Choose a stronger password.";
    default: return "Something went wrong. Please try again.";
  }
}
/** Always creates an ordinary customer. No role is ever written from the client. */
export async function signUpCustomer(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  await updateProfile(user, { displayName: name.trim() }); await sendEmailVerification(user); return user;
}
export async function signInCustomer(email: string, password: string, remember = false) {
  await setPersistence(auth(), remember ? browserLocalPersistence : browserSessionPersistence);
  return (await signInWithEmailAndPassword(auth(), email.trim(), password)).user;
}
/** Exchanges the fresh ID token for an HTTP-only session cookie. Returns false if the server isn't configured. */
export async function establishSession(): Promise<boolean> {
  const idToken = await auth().currentUser?.getIdToken(true); if (!idToken) return false;
  const r = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) }); return r.ok;
}
export async function signOutUser() { try { await fetch("/api/auth/session", { method: "DELETE" }); } catch {} const a = getClientAuth(); if (a) await signOut(a); }
export async function requestPasswordReset(email: string) {
  try { await sendPasswordResetEmail(auth(), email.trim()); } catch (e) { if (e instanceof AuthNotConfiguredError) throw e; /* swallow: never reveal whether an email exists */ }
}
let lastSent = 0;
export async function resendVerificationEmail(): Promise<"sent" | "wait"> {
  if (Date.now() - lastSent < 60_000) return "wait";
  const u = auth().currentUser; if (!u) throw new Error("Not signed in"); await sendEmailVerification(u); lastSent = Date.now(); return "sent";
}

/** Re-reads the user from Firebase so a freshly verified email is picked up. */
export async function refreshUser() { await auth().currentUser?.reload(); }

export async function updateDisplayName(name: string) { const u = auth().currentUser; if (u) await updateProfile(u, { displayName: name }); }
/** Re-authenticates with the current password first, as Firebase requires for sensitive changes. */
export async function changePassword(current: string, next: string) { const u = auth().currentUser; if (!u?.email) throw new Error("Not signed in"); await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, current)); await updatePassword(u, next); }
