export function validateContact(input: unknown): { ok: true; value: { name: string; email: string; message: string }; spam: boolean } | { ok: false; errors: Record<string, string> } {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>; const t = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : ""); const e: Record<string, string> = {};
  const name = t(o.name, 80), email = t(o.email, 120), message = t(o.message, 2000);
  if (name.length < 2) e.name = "Enter your name."; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Enter a valid email address."; if (message.length < 10) e.message = "Write at least a few words (10 characters).";
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, value: { name, email, message }, spam: t(o.website, 50) !== "" }; // "website" is a hidden honeypot field
}
