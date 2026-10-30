"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { establishSession, mapAuthError, requestPasswordReset, signInCustomer, signOutUser, signUpCustomer } from "@/lib/auth/service";
import { safeRedirect, validateEmail, validateLogin, validateSignup } from "@/lib/auth/validation";
import { Field, Notice, PasswordField, SetupNotice, Strength, Submit, TextInput } from "./ui";
export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter(); const next = useSearchParams().get("next");
  const [f, setF] = useState({ email: "", password: "", remember: false }); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); const v = validateLogin(f); setErr(v); if (Object.keys(v).length) return; setBusy(true);
    try {
      await signInCustomer(f.email, f.password, !admin && f.remember);
      const ok = await establishSession();
      if (admin) { if (!ok) { await signOutUser(); throw Object.assign(new Error(), { code: "session" }); } router.replace("/admin"); router.refresh(); }
      else router.replace(safeRedirect(next));
    } catch (x) { setMsg((x as { code?: string }).code === "session" ? "A secure admin session couldn't be started. Check the server configuration." : mapAuthError(x)); } finally { setBusy(false); }
  }
  return (<form onSubmit={submit} noValidate><SetupNotice />{msg && <Notice tone="error">{msg}</Notice>}
    <Field id="email" label="Email address" error={err.email}><TextInput id="email" type="email" autoComplete="email" value={f.email} error={err.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
    <PasswordField id="password" label="Password" autoComplete="current-password" value={f.password} error={err.password} onChange={(v) => setF({ ...f, password: v })} />
    {!admin && <div className="mb-6 flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={f.remember} onChange={(e) => setF({ ...f, remember: e.target.checked })} />Keep me signed in</label><Link href="/forgot-password" className="underline underline-offset-4">Forgot password?</Link></div>}
    <Submit busy={busy}>Sign in</Submit></form>);
}
export function SignupForm() {
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", terms: false }); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); const v = validateSignup(f); setErr(v); if (Object.keys(v).length) return; setBusy(true);
    try { await signUpCustomer(f.name, f.email, f.password); setDone(true); } catch (x) { setMsg(mapAuthError(x)); } finally { setBusy(false); }
  }
  if (done) return <Notice tone="ok">We've sent a verification link to {f.email}. Open it, then <Link href="/account" className="underline">continue to your account</Link>.</Notice>;
  return (<form onSubmit={submit} noValidate><SetupNotice />{msg && <Notice tone="error">{msg}</Notice>}
    <Field id="name" label="Full name" error={err.name}><TextInput id="name" autoComplete="name" value={f.name} error={err.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
    <Field id="email" label="Email address" error={err.email}><TextInput id="email" type="email" autoComplete="email" value={f.email} error={err.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
    <PasswordField id="password" label="Password" autoComplete="new-password" hint="At least 10 characters with upper and lower case letters and a number." value={f.password} error={err.password} onChange={(v) => setF({ ...f, password: v })} />
    <Strength value={f.password} />
    <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" value={f.confirm} error={err.confirm} onChange={(v) => setF({ ...f, confirm: v })} />
    <div className="mb-6"><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} />
      <span>I agree to the <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.</span></label>{err.terms && <p role="alert" className="mt-1 text-xs text-[#8a2f2f]">{err.terms}</p>}</div>
    <Submit busy={busy}>Create account</Submit></form>);
}
export function ForgotForm() {
  const [email, setEmail] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); const v = validateEmail(email); setErr(v ?? ""); if (v) return; setBusy(true); setMsg("");
    try { await requestPasswordReset(email); setDone(true); } catch (x) { setMsg(mapAuthError(x)); } finally { setBusy(false); }
  }
  if (done) return <><Notice tone="ok">If an account exists for that address, a reset link is on its way.</Notice><Link href="/login" className="text-sm underline">Back to sign in</Link></>;
  return (<form onSubmit={submit} noValidate><SetupNotice />{msg && <Notice tone="error">{msg}</Notice>}
    <Field id="email" label="Email address" error={err}><TextInput id="email" type="email" autoComplete="email" value={email} error={err} onChange={(e) => setEmail(e.target.value)} /></Field>
    <Submit busy={busy}>Send reset link</Submit><p className="mt-6 text-center text-sm"><Link href="/login" className="underline">Back to sign in</Link></p></form>);
}
