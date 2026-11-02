"use client";
import { useCallback, useEffect, useState } from "react";
import { apiMessage, authedFetch, ApiError } from "@/lib/auth/clientFetch"; import { validateAddress } from "@/lib/account/validation";
import type { Address } from "@/lib/types"; import EmptyState from "@/components/EmptyState"; import { Field, Notice, TextInput } from "@/components/auth/ui";
const blank = { fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", country: "India", label: "Home" };
type Form = typeof blank;
export default function Addresses() {
  const [items, setItems] = useState<Address[] | null>(null); const [msg, setMsg] = useState(""); const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState<Form>(blank); const [err, setErr] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState<string | null>(null);
  const load = useCallback(() => authedFetch<{ items: Address[] }>("/api/account/addresses").then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); }), []);
  useEffect(() => { load(); }, [load]);
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setMsg(""); try { await fn(); await load(); return true; } catch (e) { if (e instanceof ApiError && e.fields) setErr(e.fields); else setMsg(apiMessage(e)); return false; } finally { setBusy(false); } };
  const edit = (a?: Address) => { setErr({}); setMsg(""); setEditing(a ? a.id : "new"); setF(a ? { ...blank, ...a, line2: a.line2 ?? "", landmark: a.landmark ?? "" } : blank); };
  async function save(e: React.FormEvent) {
    e.preventDefault(); const v = validateAddress(f); if (!v.ok) return setErr(v.errors); setErr({});
    const ok = await run(() => authedFetch(editing === "new" ? "/api/account/addresses" : `/api/account/addresses/${editing}`, { method: editing === "new" ? "POST" : "PATCH", json: v.value })); if (ok) setEditing(null);
  }
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const inp = (k: keyof Form, label: string, auto?: string, type = "text") => <Field id={k} label={label} error={err[k]}><TextInput id={k} type={type} autoComplete={auto} value={f[k]} error={err[k]} onChange={set(k)} /></Field>;
  return (<div><div className="mb-6 flex items-end justify-between"><h1 className="font-serif text-4xl">Saved addresses</h1>{!editing && <button onClick={() => edit()} className="bg-espresso px-5 py-2.5 text-sm text-ivory hover:bg-ink">Add address</button>}</div>
    {msg && <Notice tone="error">{msg}</Notice>}
    {editing ? (<form onSubmit={save} noValidate className="max-w-xl"><h2 className="mb-4 font-serif text-2xl">{editing === "new" ? "New address" : "Edit address"}</h2>
      {inp("fullName", "Recipient full name", "name")}{inp("phone", "Mobile number", "tel", "tel")}{inp("line1", "Address line 1", "address-line1")}{inp("line2", "Address line 2 (optional)", "address-line2")}{inp("landmark", "Landmark (optional)")}
      <div className="grid grid-cols-2 gap-4">{inp("city", "City", "address-level2")}{inp("state", "State", "address-level1")}</div>
      <div className="grid grid-cols-2 gap-4">{inp("pincode", "PIN code", "postal-code")}<Field id="label" label="Label" error={err.label}><select id="label" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5">{["Home", "Work", "Other"].map((l) => <option key={l}>{l}</option>)}</select></Field></div>
      <p className="mb-5 text-xs text-espresso/60">Country: India</p>
      <div className="flex gap-3"><button disabled={busy} className="bg-espresso px-6 py-2.5 text-sm text-ivory hover:bg-ink disabled:opacity-60">{busy ? "Saving…" : "Save address"}</button><button type="button" onClick={() => setEditing(null)} className="px-4 text-sm underline">Cancel</button></div></form>)
    : items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />
    : items.length === 0 ? <EmptyState title="No saved addresses" body="Add an address to make checkout faster." />
    : <ul className="grid gap-4 md:grid-cols-2">{items.map((a) => (<li key={a.id} className="border border-champagne/60 p-5 text-sm">
        <div className="mb-2 flex items-center gap-2"><span className="font-serif text-lg">{a.label}</span>{a.isDefault && <span className="border border-gold px-2 text-xs text-gold">Default</span>}</div>
        <p>{a.fullName} · {a.phone}</p><p className="text-espresso/75">{[a.line1, a.line2, a.landmark].filter(Boolean).join(", ")}</p><p className="text-espresso/75">{a.city}, {a.state} {a.pincode}, {a.country}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4"><button className="underline" onClick={() => edit(a)}>Edit</button>
          {!a.isDefault && <button disabled={busy} className="underline" onClick={() => run(() => authedFetch(`/api/account/addresses/${a.id}/default`, { method: "POST" }))}>Make default</button>}
          {confirm === a.id ? (<span role="alert">Delete this address? <button className="underline" onClick={() => { setConfirm(null); run(() => authedFetch(`/api/account/addresses/${a.id}`, { method: "DELETE" })); }}>Yes, delete</button> <button className="underline" onClick={() => setConfirm(null)}>Keep</button></span>)
            : <button className="underline" onClick={() => setConfirm(a.id)}>Delete</button>}</div></li>))}</ul>}
  </div>);
}
