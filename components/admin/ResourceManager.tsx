"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { formatInr } from "@/lib/format"; import EmptyState from "@/components/EmptyState"; import { Field, Notice, TextInput } from "@/components/auth/ui";
type F = { key: string; label: string; type?: "text" | "number" | "textarea" | "select" | "checkbox" | "datetime"; options?: string[]; hint?: string; lockOnEdit?: boolean };
type C = { key: string; label: string; format?: "bool" | "inr" | "date" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any> & { id: string };
const local = (iso?: string) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cell = (v: any, f?: C["format"]) => (v === undefined || v === null || v === "" ? "—" : f === "bool" ? (v ? "Yes" : "No") : f === "inr" ? formatInr(Number(v)) : f === "date" ? new Date(v).toLocaleDateString("en-IN", { dateStyle: "medium" }) : String(v));
export default function ResourceManager({ title, endpoint, fields, columns, defaults = {}, intro, emptyTitle, emptyBody }: { title: string; endpoint: string; fields: F[]; columns: C[]; defaults?: Record<string, unknown>; intro?: string; emptyTitle: string; emptyBody: string }) {
  const [items, setItems] = useState<Row[] | null>(null); const [editing, setEditing] = useState<string | null>(null); const [form, setForm] = useState<Record<string, unknown>>({});
  const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState<string | null>(null);
  const load = useCallback(() => authedFetch<{ items: Row[] }>(endpoint).then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); }), [endpoint]);
  useEffect(() => { load(); }, [load]);
  const open = (r?: Row) => { setErr({}); setMsg(""); setEditing(r ? r.id : "new"); setForm(r ? Object.fromEntries(fields.map((f) => [f.key, f.type === "datetime" ? local(r[f.key]) : r[f.key] ?? ""])) : { ...defaults }); };
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(""); setErr({});
    const body = Object.fromEntries(fields.map((f) => { const v = form[f.key]; return [f.key, f.type === "checkbox" ? v === true : f.type === "number" ? (v === "" || v == null ? "" : Number(v)) : f.type === "datetime" ? (v ? new Date(String(v)).toISOString() : "") : v ?? ""]; }));
    try { await authedFetch(editing === "new" ? endpoint : `${endpoint}/${editing}`, { method: editing === "new" ? "POST" : "PATCH", json: body }); setEditing(null); await load(); }
    catch (x) { if (x instanceof ApiError && x.fields) setErr(x.fields); else setMsg(apiMessage(x)); } finally { setBusy(false); }
  }
  async function del(id: string) { setConfirm(null); setMsg(""); try { await authedFetch(`${endpoint}/${id}`, { method: "DELETE" }); await load(); } catch (x) { setMsg((x as ApiError).code === "category_in_use" ? "This category still has products. Move or delete them first." : apiMessage(x)); } }
  return (<div><div className="mb-2 flex items-end justify-between"><h1 className="font-serif text-4xl">{title}</h1>{!editing && <button onClick={() => open()} className="bg-espresso px-5 py-2.5 text-sm text-ivory hover:bg-ink">Add new</button>}</div>
    {intro && <p className="mb-6 max-w-xl text-sm text-espresso/70">{intro}</p>}{msg && <Notice tone="error">{msg}</Notice>}
    {editing ? (<form onSubmit={save} noValidate className="max-w-xl">{fields.map((f) => { const id = `f-${f.key}`; const locked = f.lockOnEdit && editing !== "new"; const v = form[f.key] as string; const set = (x: unknown) => setForm({ ...form, [f.key]: x });
        return f.type === "checkbox" ? <label key={f.key} className="mb-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={form[f.key] === true} onChange={(e) => set(e.target.checked)} />{f.label}</label>
        : <Field key={f.key} id={id} label={f.label} error={err[f.key]} hint={f.hint}>{f.type === "select" ? <select id={id} value={v ?? ""} onChange={(e) => set(e.target.value)} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5">{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
          : f.type === "textarea" ? <textarea id={id} rows={3} value={v ?? ""} onChange={(e) => set(e.target.value)} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5" />
          : <TextInput id={id} type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"} value={v ?? ""} disabled={locked} error={err[f.key]} onChange={(e) => set(e.target.value)} />}</Field>; })}
      <div className="flex gap-3"><button disabled={busy} className="bg-espresso px-6 py-2.5 text-sm text-ivory hover:bg-ink disabled:opacity-60">{busy ? "Saving…" : "Save"}</button><button type="button" onClick={() => setEditing(null)} className="px-4 text-sm underline">Cancel</button></div></form>)
    : items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />
    : items.length === 0 ? <EmptyState title={emptyTitle} body={emptyBody} />
    : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-champagne/60">{columns.map((c) => <th key={c.key} className="py-2 pr-4 font-normal text-espresso/60">{c.label}</th>)}<th /></tr></thead>
      <tbody>{items.map((r) => (<tr key={r.id} className="border-b border-champagne/30">{columns.map((c) => <td key={c.key} className="py-3 pr-4">{cell(r[c.key], c.format)}</td>)}
        <td className="whitespace-nowrap py-3 text-right"><button className="underline" onClick={() => open(r)}>Edit</button>{" "}{confirm === r.id ? <span role="alert">Delete? <button className="underline" onClick={() => del(r.id)}>Yes</button> <button className="underline" onClick={() => setConfirm(null)}>No</button></span> : <button className="ml-3 underline" onClick={() => setConfirm(r.id)}>Delete</button>}</td></tr>))}</tbody></table></div>}
  </div>);
}
