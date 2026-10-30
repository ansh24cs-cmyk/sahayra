export type Errors<T extends string> = Partial<Record<T, string>>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const validateEmail = (v: string) => (!v.trim() ? "Enter your email address." : !EMAIL.test(v.trim()) ? "Enter a valid email, for example name@example.com." : null);
export function passwordIssues(pw: string): string[] {
  const m: string[] = [];
  if (pw.length < 10) m.push("at least 10 characters");
  if (!/[a-z]/.test(pw)) m.push("a lowercase letter");
  if (!/[A-Z]/.test(pw)) m.push("an uppercase letter");
  if (!/\d/.test(pw)) m.push("a number");
  return m;
}
export const passwordStrength = (pw: string) => (pw ? 4 - passwordIssues(pw).length + (pw.length >= 14 ? 1 : 0) : 0); // 0..5
export function validateSignup(v: { name: string; email: string; password: string; confirm: string; terms: boolean }) {
  const e: Errors<"name" | "email" | "password" | "confirm" | "terms"> = {};
  if (v.name.trim().length < 2) e.name = "Enter your full name.";
  const em = validateEmail(v.email); if (em) e.email = em;
  const pi = passwordIssues(v.password); if (pi.length) e.password = `Password needs ${pi.join(", ")}.`;
  if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  if (!v.terms) e.terms = "Please accept the terms and privacy policy to continue.";
  return e;
}
export function validateLogin(v: { email: string; password: string }) {
  const e: Errors<"email" | "password"> = {}; const em = validateEmail(v.email); if (em) e.email = em;
  if (!v.password) e.password = "Enter your password."; return e;
}
/** Only same-site relative paths. Blocks //host, /\host, scheme:, and control characters. */
export function safeRedirect(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !/^\/(?![/\\])[^\s\\]*$/.test(next) || next.includes("://") || /[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}
