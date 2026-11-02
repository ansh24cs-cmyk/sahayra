"use client";
import { useEffect, useState } from "react";
import { ApiError, apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { Field, Notice, TextInput } from "@/components/auth/ui";
type S = Record<"storeName" | "supportEmail" | "supportPhone" | "announcement" | "shippingFlatInr" | "freeShippingAboveInr", string>;
const L: [keyof S, string, string?][] = [["storeName", "Store name"], ["supportEmail", "Support email"], ["supportPhone", "Support phone"], ["announcement", "Announcement text", "Stored for the storefront announcement bar; wiring it in is a later step."], ["shippingFlatInr", "Flat shipping charge (₹)"], ["freeShippingAboveInr", "Free shipping above (₹, optional)"]];
export default function SettingsAdmin() {
  const [s, setS] = useState<S | null>(null); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { authedFetch<{ settings: Record<string, unknown> }>("/api/admin/settings").then((r) => setS(Object.fromEntries(L.map(([k]) => [k, String(r.settings[k] ?? "")])) as S)).catch((e) => setMsg(apiMessage(e))); }, []);
  async function save(e: React.FormEvent) { e.preventDefault(); setBusy(true); setErr({}); setMsg(""); setOk(false); try { await authedFetch("/api/admin/settings", { method: "PUT", json: s }); setOk(true); } catch (x) { if (x instanceof ApiError && x.fields) setErr(x.fields); else setMsg(apiMessage(x)); } finally { setBusy(false); } }
  return (<div><h1 className="mb-6 font-serif text-4xl">Settings</h1>{msg && <Notice tone="error">{msg}</Notice>}{ok && <Notice tone="ok">Settings saved.</Notice>}
    {!s ? (!msg && <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />) : (<form onSubmit={save} noValidate className="max-w-xl">{L.map(([k, label, hint]) => <Field key={k} id={k} label={label} hint={hint} error={err[k]}><TextInput id={k} value={s[k]} error={err[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></Field>)}
      <button disabled={busy} className="bg-espresso px-6 py-2.5 text-sm text-ivory hover:bg-ink disabled:opacity-60">{busy ? "Saving…" : "Save settings"}</button></form>)}</div>);
}
