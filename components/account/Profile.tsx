"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; import { ApiError, apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { changePassword, mapAuthError, updateDisplayName } from "@/lib/auth/service"; import { validateProfile } from "@/lib/account/validation"; import { passwordIssues } from "@/lib/auth/validation";
import { Field, Notice, PasswordField, Strength, Submit, TextInput } from "@/components/auth/ui";
export default function Profile() {
  const { user } = useAuth(); const [f, setF] = useState({ displayName: "", phone: "" }); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null); const [busy, setBusy] = useState(false);
  const [p, setP] = useState({ cur: "", next: "", confirm: "" }); const [pe, setPe] = useState<Record<string, string>>({}); const [pm, setPm] = useState<{ t: "ok" | "error"; m: string } | null>(null); const [pb, setPb] = useState(false);
  useEffect(() => { authedFetch<{ displayName: string; phone: string }>("/api/account/profile").then((r) => setF({ displayName: r.displayName || user?.displayName || "", phone: r.phone })).catch(() => setF((x) => ({ ...x, displayName: user?.displayName ?? "" }))); }, [user?.displayName]);
  async function save(e: React.FormEvent) { e.preventDefault(); setMsg(null); const v = validateProfile(f); if (!v.ok) return setErr(v.errors); setErr({}); setBusy(true);
    try { await authedFetch("/api/account/profile", { method: "PATCH", json: v.value }); await updateDisplayName(v.value.displayName); setMsg({ t: "ok", m: "Profile saved." }); } catch (x) { if (x instanceof ApiError && x.fields) setErr(x.fields); else setMsg({ t: "error", m: apiMessage(x) }); } finally { setBusy(false); } }
  async function pass(e: React.FormEvent) { e.preventDefault(); setPm(null); const er: Record<string, string> = {}; if (!p.cur) er.cur = "Enter your current password."; const i = passwordIssues(p.next); if (i.length) er.next = `Password needs ${i.join(", ")}.`; if (p.confirm !== p.next) er.confirm = "Passwords do not match."; setPe(er); if (Object.keys(er).length) return; setPb(true);
    try { await changePassword(p.cur, p.next); setP({ cur: "", next: "", confirm: "" }); setPm({ t: "ok", m: "Password updated." }); } catch (x) { setPm({ t: "error", m: mapAuthError(x) }); } finally { setPb(false); } }
  return (<div className="max-w-md"><h1 className="font-serif text-4xl">Profile</h1><p className="mt-2 text-sm text-espresso/70">{user?.email} ({user?.emailVerified ? "verified" : "not verified"})</p>
    <form onSubmit={save} noValidate className="mt-8">{msg && <Notice tone={msg.t}>{msg.m}</Notice>}
      <Field id="displayName" label="Full name" error={err.displayName}><TextInput id="displayName" autoComplete="name" value={f.displayName} error={err.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} /></Field>
      <Field id="phone" label="Mobile number (optional)" error={err.phone}><TextInput id="phone" type="tel" autoComplete="tel" value={f.phone} error={err.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field><Submit busy={busy}>Save profile</Submit></form>
    <form onSubmit={pass} noValidate className="mt-12 border-t border-champagne/60 pt-8"><h2 className="mb-4 font-serif text-2xl">Change password</h2>{pm && <Notice tone={pm.t}>{pm.m}</Notice>}
      <PasswordField id="cur" label="Current password" autoComplete="current-password" value={p.cur} error={pe.cur} onChange={(v) => setP({ ...p, cur: v })} />
      <PasswordField id="next" label="New password" autoComplete="new-password" hint="At least 10 characters with upper and lower case letters and a number." value={p.next} error={pe.next} onChange={(v) => setP({ ...p, next: v })} /><Strength value={p.next} />
      <PasswordField id="confirm" label="Confirm new password" autoComplete="new-password" value={p.confirm} error={pe.confirm} onChange={(v) => setP({ ...p, confirm: v })} /><Submit busy={pb}>Update password</Submit></form></div>);
}
