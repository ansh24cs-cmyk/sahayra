"use client";
import { useState, ReactNode } from "react";
import { passwordStrength } from "@/lib/auth/validation";
import { firebaseReady } from "@/lib/firebase/client";
import { missingPublicConfig } from "@/lib/config";
export function AuthShell({ title, sub, children, foot }: { title: string; sub?: string; children: ReactNode; foot?: ReactNode }) {
  return (<div className="mx-auto max-w-md px-5 py-16 md:py-24"><h1 className="font-serif text-4xl">{title}</h1>{sub && <p className="mt-2 text-sm text-espresso/70">{sub}</p>}
    <div className="mt-8">{children}</div>{foot && <p className="mt-8 text-center text-sm text-espresso/70">{foot}</p>}</div>);
}
export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (<div className="mb-5"><label htmlFor={id} className="mb-1 block text-sm">{label}</label>{children}
    {hint && !error && <p id={`${id}-h`} className="mt-1 text-xs text-espresso/60">{hint}</p>}{error && <p id={`${id}-e`} role="alert" className="mt-1 text-xs text-[#8a2f2f]">{error}</p>}</div>);
}
export function TextInput(p: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  const { error, ...r } = p;
  return <input {...r} aria-invalid={!!error} aria-describedby={error ? `${p.id}-e` : undefined} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5 outline-none focus:border-gold" />;
}
export function PasswordField({ id, label, value, onChange, error, autoComplete, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (<Field id={id} label={label} error={error} hint={hint}><div className="relative"><TextInput id={id} type={show ? "text" : "password"} value={value} error={error} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
    <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs underline">{show ? "Hide" : "Show"}</button></div></Field>);
}
export function Strength({ value }: { value: string }) {
  const s = passwordStrength(value); const label = ["", "Weak", "Weak", "Fair", "Good", "Strong"][s];
  return value ? (<div className="-mt-3 mb-5" aria-live="polite"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={`h-1 flex-1 ${i <= s ? "bg-gold" : "bg-espresso/15"}`} />)}</div><p className="mt-1 text-xs text-espresso/60">Password strength: {label}</p></div>) : null;
}
export function Submit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return <button disabled={busy} className="w-full bg-espresso py-3 text-ivory transition-colors hover:bg-ink disabled:opacity-60">{busy ? "Please wait…" : children}</button>;
}
export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: ReactNode }) {
  const c = tone === "error" ? "border-[#8a2f2f]/50" : tone === "ok" ? "border-gold" : "border-champagne";
  return <div role={tone === "error" ? "alert" : "status"} className={`mb-5 border ${c} px-4 py-3 text-sm`}>{children}</div>;
}
export function SetupNotice() {
  return firebaseReady ? null : <Notice>Authentication isn't connected yet. Missing: <code>{missingPublicConfig().join(", ") || "unknown"}</code>. Add them to <code>.env.local</code>, restart the dev server, and see <code>docs/AUTH_SETUP.md</code>. Nothing here will pretend to sign you in.</Notice>;
}
