"use client";
import { useEffect, useState } from "react";
import { apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { useCart } from "@/context/CartContext"; import { useWishlist } from "@/context/WishlistContext";
import { formatInr, lowestPrice } from "@/lib/format"; import type { Product } from "@/lib/types"; import EmptyState from "@/components/EmptyState"; import { Notice } from "@/components/auth/ui";
export default function Wishlist() {
  const [items, setItems] = useState<Product[] | null>(null); const [msg, setMsg] = useState(""); const [pick, setPick] = useState<Record<string, string>>({}); const { add } = useCart(); const { toggle } = useWishlist();
  useEffect(() => { authedFetch<{ items: Product[] }>("/api/account/wishlist").then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); }); }, []);
  return (<div><h1 className="mb-6 font-serif text-4xl">Wishlist</h1>{msg && <Notice tone="error">{msg}</Notice>}
    {items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />
    : items.length === 0 ? <EmptyState title="Your wishlist is empty" body="Tap the heart on any piece to save it here." href="/shop" cta="Browse jewellery" />
    : <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">{items.map((p) => { const avail = p.variants.filter((v) => v.stock > 0); const sku = pick[p.id] ?? avail[0]?.sku; const v = avail.find((x) => x.sku === sku);
        return (<li key={p.id}><div className="aspect-[4/5] bg-champagne/20">{p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}</div>
          <h2 className="mt-3 font-serif text-lg">{p.name}</h2><p className="text-sm">{formatInr(v?.priceInr ?? lowestPrice(p.variants))}</p>
          {avail.length > 1 && <select aria-label={`Option for ${p.name}`} value={sku} onChange={(e) => setPick({ ...pick, [p.id]: e.target.value })} className="mt-2 w-full border border-espresso/30 bg-transparent px-2 py-1 text-sm">{avail.map((x) => <option key={x.sku} value={x.sku}>{x.label}</option>)}</select>}
          <div className="mt-3 flex items-center gap-4 text-sm">{v ? <button className="bg-espresso px-4 py-2 text-ivory hover:bg-ink" onClick={() => add({ productId: p.id, sku: v.sku, name: p.name, variantLabel: v.label, priceInr: v.priceInr, image: p.images[0] })}>Add to bag</button> : <span className="text-gold">Currently unavailable</span>}
            <button className="underline" onClick={() => { toggle(p.id); setItems(items.filter((x) => x.id !== p.id)); }}>Remove</button></div></li>); })}</ul>}
  </div>);
}
