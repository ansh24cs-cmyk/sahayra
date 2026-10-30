import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatInr, inStock, lowestPrice } from "@/lib/format";
export default function ProductCard({ p }: { p: Product }) {
  const ok = inStock(p.variants);
  return (<article className="group">
    <Link href={`/product/${p.slug}`} className="block aspect-[4/5] overflow-hidden bg-champagne/20">
      {p.images[0] && <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
    </Link>
    <div className="mt-3 flex items-start justify-between gap-3">
      <div><h3 className="font-serif text-lg leading-tight">{p.name}</h3><p className="text-xs text-espresso/60">{p.material}</p></div>
      <p className="text-sm">{formatInr(lowestPrice(p.variants))}</p>
    </div>
    {!ok && <p className="mt-1 text-xs text-gold">Currently unavailable</p>}
  </article>);
}
