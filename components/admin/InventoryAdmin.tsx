"use client";
import { useEffect, useState } from "react";
import { apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import type { Product } from "@/lib/types"; import EmptyState from "@/components/EmptyState"; import { Notice } from "@/components/auth/ui";
export default function InventoryAdmin() {
  const [items, setItems] = useState<Product[] | null>(null); const [edit, setEdit] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [saving, setSaving] = useState("");
  const load = () => authedFetch<{ items: Product[] }>("/api/admin/products").then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); });
  useEffect(() => { load(); }, []);
  async function save(p: Product, sku: string) { setSaving(sku); setMsg(""); try { await authedFetch(`/api/admin/products/${p.id}/stock`, { method: "PATCH", json: { sku, stock: edit[sku] } }); setEdit(({ [sku]: _, ...r }) => r); await load(); } catch (e) { setMsg(apiMessage(e)); } finally { setSaving(""); } }
  const rows = (items ?? []).flatMap((p) => p.variants.map((v) => ({ p, v })));
  return (<div><h1 className="mb-6 font-serif text-4xl">Inventory</h1>{msg && <Notice tone="error">{msg}</Notice>}
    {items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" /> : rows.length === 0 ? <EmptyState title="No stock to manage" body="Stock for each variant appears here once you add products." />
    : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-champagne/60">{["Product", "Variant", "SKU", "Stock", ""].map((h) => <th key={h} className="py-2 pr-4 font-normal text-espresso/60">{h}</th>)}</tr></thead>
      <tbody>{rows.map(({ p, v }) => { const dirty = edit[v.sku] !== undefined && edit[v.sku] !== String(v.stock); return (<tr key={v.sku} className="border-b border-champagne/30"><td className="py-3 pr-4">{p.name}</td><td className="pr-4">{v.label}</td><td className="pr-4">{v.sku}</td>
        <td className="pr-4"><label className="sr-only" htmlFor={`s-${v.sku}`}>Stock for {v.sku}</label><input id={`s-${v.sku}`} type="number" min={0} value={edit[v.sku] ?? v.stock} onChange={(e) => setEdit({ ...edit, [v.sku]: e.target.value })} className="w-20 border border-espresso/30 bg-transparent px-2 py-1" />{v.stock === 0 ? <span className="ml-2 text-gold">Out</span> : v.stock <= 3 ? <span className="ml-2 text-gold">Low</span> : null}</td>
        <td><button disabled={!dirty || saving === v.sku} onClick={() => save(p, v.sku)} className="underline disabled:opacity-40">{saving === v.sku ? "Saving…" : "Save"}</button></td></tr>); })}</tbody></table></div>}</div>);
}
