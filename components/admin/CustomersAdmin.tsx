"use client";
import { useEffect, useState } from "react";
import { apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import EmptyState from "@/components/EmptyState"; import { Notice } from "@/components/auth/ui";
type C = { uid: string; email: string | null; displayName: string | null; emailVerified: boolean; disabled: boolean; createdAt: string; lastSignIn: string | null; isOwner: boolean };
export default function CustomersAdmin() {
  const [items, setItems] = useState<C[] | null>(null); const [next, setNext] = useState<string | null>(null); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const load = async (token?: string) => { setBusy(true); try { const r = await authedFetch<{ items: C[]; nextToken: string | null }>(`/api/admin/customers${token ? `?token=${encodeURIComponent(token)}` : ""}`); setItems((p) => [...(token ? p ?? [] : []), ...r.items]); setNext(r.nextToken); } catch (e) { setMsg(apiMessage(e)); setItems((p) => p ?? []); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—");
  return (<div><h1 className="mb-6 font-serif text-4xl">Customers</h1>{msg && <Notice tone="error">{msg}</Notice>}
    {items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" /> : items.length === 0 ? <EmptyState title="No customers yet" body="Registered accounts appear here. This list comes straight from Firebase Authentication." />
    : <><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-champagne/60">{["Name", "Email", "Verified", "Joined", "Last sign-in", ""].map((h) => <th key={h} className="py-2 pr-4 font-normal text-espresso/60">{h}</th>)}</tr></thead>
      <tbody>{items.map((c) => (<tr key={c.uid} className="border-b border-champagne/30"><td className="py-3 pr-4">{c.displayName ?? "—"}</td><td className="pr-4">{c.email ?? "—"}</td><td className="pr-4">{c.emailVerified ? "Yes" : "No"}</td><td className="pr-4">{d(c.createdAt)}</td><td className="pr-4">{d(c.lastSignIn)}</td><td>{c.isOwner ? "Owner" : c.disabled ? "Disabled" : ""}</td></tr>))}</tbody></table></div>
      {next && <button disabled={busy} onClick={() => load(next)} className="mt-6 underline">{busy ? "Loading…" : "Load more"}</button>}</>}</div>);
}
