"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api"; import type { Category, Paged, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard"; import EmptyState from "@/components/EmptyState"; import { CATEGORIES } from "@/lib/categories";
const PAGE = 12;
export default function Shop() {
  const sp = useSearchParams(); const router = useRouter();
  const [data, setData] = useState<Paged<Product> | null>(null); const [err, setErr] = useState(false);
  const q = sp.get("q") ?? ""; const category = (sp.get("category") ?? undefined) as Category | undefined; const sort = (sp.get("sort") ?? "new") as "new" | "low" | "high";
  const maxPrice = sp.get("max") ? Number(sp.get("max")) : undefined; const stock = sp.get("stock") === "1"; const page = Number(sp.get("page") ?? 1);
  const set = (k: string, v?: string) => { const n = new URLSearchParams(sp.toString()); v ? n.set(k, v) : n.delete(k); if (k !== "page") n.delete("page"); router.push(`/shop?${n}`); };
  useEffect(() => { setData(null); setErr(false); getProducts({ q, category, sort, maxPrice, inStock: stock, page }).then(setData).catch(() => setErr(true)); }, [q, category, sort, maxPrice, stock, page]);
  const pages = data ? Math.ceil(data.total / PAGE) : 0;
  return (<div className="mx-auto max-w-7xl px-5 py-12"><h1 className="font-serif text-5xl">{category ? CATEGORIES.find((c) => c[0] === category)?.[1] : "All jewellery"}</h1>
    {q && <p className="mt-2 text-sm text-espresso/70">Results for “{q}”</p>}
    <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-5 text-sm"><Link href="/shop" className={!category ? "text-gold underline underline-offset-4" : ""}>All</Link>
      {CATEGORIES.map(([s, n]) => <Link key={s} href={`/shop?category=${s}`} className={category === s ? "text-gold underline underline-offset-4" : ""}>{n}</Link>)}</nav>
    <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-champagne/60 py-4 text-sm">
      <label className="flex items-center gap-2">Sort<select value={sort} onChange={(e) => set("sort", e.target.value)} className="border border-espresso/30 bg-transparent px-2 py-1"><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      <label className="flex items-center gap-2">Up to<select value={maxPrice ?? ""} onChange={(e) => set("max", e.target.value)} className="border border-espresso/30 bg-transparent px-2 py-1"><option value="">Any price</option>{[1000, 2500, 5000, 10000].map((n) => <option key={n} value={n}>₹{n.toLocaleString("en-IN")}</option>)}</select></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={stock} onChange={(e) => set("stock", e.target.checked ? "1" : undefined)} />In stock only</label></div>
    <div className="mt-10">{err ? <EmptyState title="We couldn't load the products" body="Check your connection and try again." href="/shop" cta="Retry" />
      : !data ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-champagne/25" />)}</div>
      : data.items.length === 0 ? <EmptyState title="No pieces to show yet" body="Nothing matches these filters, or products haven't been added yet." href="/shop" cta="Clear filters" />
      : <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}</div>
    {pages > 1 && <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2 text-sm">{Array.from({ length: pages }).map((_, i) => <button key={i} onClick={() => set("page", String(i + 1))} aria-current={page === i + 1} className={`h-9 w-9 border ${page === i + 1 ? "bg-espresso text-ivory" : "border-espresso/30"}`}>{i + 1}</button>)}</nav>}
  </div>);
}
