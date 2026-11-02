"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError, apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { getClientAuth } from "@/lib/firebase/client"; import { validateProduct } from "@/lib/admin/validation"; import { formatInr, lowestPrice } from "@/lib/format"; import { CATEGORIES } from "@/lib/categories";
import type { Product } from "@/lib/types"; import EmptyState from "@/components/EmptyState"; import { Field, Notice, TextInput } from "@/components/auth/ui";
type VF = { sku: string; label: string; priceInr: string; stock: string };
type Form = { name: string; slug: string; category: string; material: string; description: string; compareAtInr: string; archived: boolean; images: string[]; variants: VF[] };
const blank = (): Form => ({ name: "", slug: "", category: "", material: "", description: "", compareAtInr: "", archived: false, images: [], variants: [{ sku: "", label: "", priceInr: "", stock: "0" }] });
export default function ProductsAdmin() {
  const [items, setItems] = useState<Product[] | null>(null); const [cats, setCats] = useState<readonly (readonly [string, string])[]>(CATEGORIES); const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState<Form>(blank()); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [up, setUp] = useState(false); const [confirm, setConfirm] = useState<string | null>(null);
  const load = useCallback(() => authedFetch<{ items: Product[] }>("/api/admin/products").then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); }), []);
  useEffect(() => { load(); fetch("/api/categories").then((r) => r.json()).then((d) => d.items?.length && setCats(d.items)).catch(() => {}); }, [load]);
  const open = (p?: Product) => { setErr({}); setMsg(""); setEditing(p ? p.id : "new"); setF(p ? { name: p.name, slug: p.slug, category: p.category, material: p.material, description: p.description ?? "", compareAtInr: p.compareAtInr ? String(p.compareAtInr) : "", archived: !!p.archived, images: p.images, variants: p.variants.map((v) => ({ sku: v.sku, label: v.label, priceInr: String(v.priceInr), stock: String(v.stock) })) } : { ...blank(), category: cats[0]?.[0] ?? "" }); };
  const setV = (i: number, k: keyof VF, v: string) => setF({ ...f, variants: f.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  async function upload(files: FileList | null) {
    if (!files?.length) return; setUp(true); setMsg("");
    try { const auth = getClientAuth(); if (!auth) throw new Error("not configured"); const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage"); const st = getStorage(auth.app); const urls: string[] = [];
      for (const file of Array.from(files)) { if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg("Only JPEG, PNG or WebP images are allowed."); continue; } if (file.size > 5 * 1024 * 1024) { setMsg("Each image must be under 5 MB."); continue; }
        const r = ref(st, `products/uploads/${crypto.randomUUID()}.${file.type.split("/")[1]}`); await uploadBytes(r, file, { contentType: file.type }); urls.push(await getDownloadURL(r)); }
      setF((p) => ({ ...p, images: [...p.images, ...urls].slice(0, 8) }));
    } catch { setMsg("Upload failed. Check that Storage is enabled and storage.rules is deployed with your admin UID."); } finally { setUp(false); }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); const v = validateProduct(f); if (!v.ok) return setErr(v.errors); setErr({}); setBusy(true);
    try { await authedFetch(editing === "new" ? "/api/admin/products" : `/api/admin/products/${editing}`, { method: editing === "new" ? "POST" : "PATCH", json: f }); setEditing(null); await load(); }
    catch (x) { if (x instanceof ApiError && x.fields) setErr(x.fields); else setMsg(apiMessage(x)); } finally { setBusy(false); }
  }
  const act = async (fn: () => Promise<unknown>) => { setMsg(""); try { await fn(); await load(); } catch (x) { setMsg(apiMessage(x)); } };
  const inp = (k: "name" | "slug" | "material" | "compareAtInr", label: string, hint?: string) => <Field id={k} label={label} error={err[k]} hint={hint}><TextInput id={k} value={f[k]} error={err[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>;
  return (<div><div className="mb-6 flex items-end justify-between"><h1 className="font-serif text-4xl">Products</h1>{!editing && <button onClick={() => open()} className="bg-espresso px-5 py-2.5 text-sm text-ivory hover:bg-ink">Add product</button>}</div>{msg && <Notice tone="error">{msg}</Notice>}
    {editing ? (<form onSubmit={save} noValidate className="max-w-2xl"><h2 className="mb-4 font-serif text-2xl">{editing === "new" ? "New product" : "Edit product"}</h2>
      {inp("name", "Name")}{inp("slug", "URL slug (optional)", "Leave blank to generate it from the name.")}
      <Field id="category" label="Category" error={err.category}><select id="category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5">{cats.map(([s, n]) => <option key={s} value={s}>{n}</option>)}</select></Field>
      {inp("material", "Material")}
      <Field id="description" label="Description" error={err.description}><textarea id="description" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5" /></Field>
      <fieldset className="mb-5"><legend className="mb-2 text-sm">Variants and stock</legend>{err.variants && <p role="alert" className="mb-2 text-xs text-[#8a2f2f]">{err.variants}</p>}
        {f.variants.map((v, i) => (<div key={i} className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-5">{(["sku", "label", "priceInr", "stock"] as const).map((k) => (<div key={k}><label className="text-xs text-espresso/60" htmlFor={`${k}${i}`}>{{ sku: "SKU", label: "Label", priceInr: "Price (₹)", stock: "Stock" }[k]}</label>
          <input id={`${k}${i}`} value={v[k]} onChange={(e) => setV(i, k, e.target.value)} aria-invalid={!!err[`variants.${i}.${k}`]} className="w-full border border-espresso/30 bg-transparent px-2 py-2" />{err[`variants.${i}.${k}`] && <p role="alert" className="text-xs text-[#8a2f2f]">{err[`variants.${i}.${k}`]}</p>}</div>))}
          <button type="button" disabled={f.variants.length === 1} onClick={() => setF({ ...f, variants: f.variants.filter((_, j) => j !== i) })} className="self-end pb-2 text-left text-sm underline disabled:opacity-40">Remove</button></div>))}
        <button type="button" onClick={() => setF({ ...f, variants: [...f.variants, { sku: "", label: "", priceInr: "", stock: "0" }] })} className="text-sm underline">Add variant</button></fieldset>
      {inp("compareAtInr", "Original price (optional)", "Shown struck-through only if you enter it and it is higher than the selling price. Leave empty for no discount display.")}
      <fieldset className="mb-5"><legend className="mb-2 text-sm">Images (JPEG, PNG or WebP, under 5 MB)</legend>{err.images && <p role="alert" className="mb-2 text-xs text-[#8a2f2f]">{err.images}</p>}
        <div className="mb-3 flex flex-wrap gap-3">{f.images.map((u, i) => (<div key={u} className="relative h-24 w-20 bg-champagne/20"><img src={u} alt="" className="h-full w-full object-cover" /><button type="button" aria-label="Remove image" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} className="absolute right-0 top-0 bg-ivory/90 px-1.5 text-xs">×</button></div>))}</div>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={up || f.images.length >= 8} onChange={(e) => upload(e.target.files)} aria-label="Upload product images" className="text-sm" />{up && <p role="status" className="mt-1 text-xs">Uploading…</p>}</fieldset>
      <label className="mb-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.archived} onChange={(e) => setF({ ...f, archived: e.target.checked })} />Hidden from the store (archived)</label>
      <div className="flex gap-3"><button disabled={busy || up} className="bg-espresso px-6 py-2.5 text-sm text-ivory hover:bg-ink disabled:opacity-60">{busy ? "Saving…" : "Save product"}</button><button type="button" onClick={() => setEditing(null)} className="px-4 text-sm underline">Cancel</button></div></form>)
    : items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />
    : items.length === 0 ? <EmptyState title="No products yet" body="Add your first product with real photos, prices and stock. It appears in the store as soon as it is saved and not archived." />
    : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-champagne/60">{["", "Name", "Category", "Price", "Stock", "Status", ""].map((h, i) => <th key={i} className="py-2 pr-4 font-normal text-espresso/60">{h}</th>)}</tr></thead>
      <tbody>{items.map((p) => (<tr key={p.id} className="border-b border-champagne/30"><td className="py-3 pr-4"><div className="h-12 w-10 bg-champagne/20">{p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}</div></td><td className="pr-4">{p.name}</td><td className="pr-4">{p.category}</td><td className="pr-4">{formatInr(lowestPrice(p.variants))}</td>
        <td className="pr-4">{p.variants.reduce((n, v) => n + v.stock, 0)}</td><td className="pr-4">{p.archived ? "Archived" : "Live"}</td>
        <td className="whitespace-nowrap text-right"><button className="underline" onClick={() => open(p)}>Edit</button> <button className="ml-3 underline" onClick={() => act(() => authedFetch(`/api/admin/products/${p.id}`, { method: "PATCH", json: { archived: !p.archived } }))}>{p.archived ? "Publish" : "Archive"}</button>{" "}
          {confirm === p.id ? <span role="alert" className="ml-3">Delete permanently? <button className="underline" onClick={() => { setConfirm(null); act(() => authedFetch(`/api/admin/products/${p.id}`, { method: "DELETE" })); }}>Yes</button> <button className="underline" onClick={() => setConfirm(null)}>No</button></span> : <button className="ml-3 underline" onClick={() => setConfirm(p.id)}>Delete</button>}</td></tr>))}</tbody></table></div>}
  </div>);
}
