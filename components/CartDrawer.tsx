"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/format";
export default function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove } = useCart();
  return (<div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
    <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
    <aside role="dialog" aria-label="Shopping bag" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-champagne/60 p-5"><h2 className="font-serif text-2xl">Your bag</h2>
        <button onClick={() => setOpen(false)} className="text-sm underline underline-offset-4">Close</button></div>
      <div className="flex-1 overflow-y-auto p-5">
        {lines.length === 0 ? <p className="mt-10 text-center text-sm text-espresso/70">Your bag is empty. <Link href="/shop" onClick={() => setOpen(false)} className="underline">Browse the collection</Link></p> :
          <ul className="space-y-5">{lines.map((l) => (<li key={l.sku} className="flex gap-4">
            <div className="h-24 w-20 shrink-0 bg-champagne/20">{l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}</div>
            <div className="flex-1 text-sm"><p className="font-serif text-base">{l.name}</p><p className="text-espresso/60">{l.variantLabel}</p>
              <div className="mt-2 flex items-center gap-3">
                <button aria-label={`Decrease ${l.name}`} onClick={() => setQty(l.sku, l.qty - 1)} className="h-7 w-7 border border-espresso/30">−</button>
                <span aria-live="polite">{l.qty}</span>
                <button aria-label={`Increase ${l.name}`} onClick={() => setQty(l.sku, l.qty + 1)} className="h-7 w-7 border border-espresso/30">+</button>
                <button onClick={() => remove(l.sku)} className="ml-auto text-xs underline">Remove</button></div></div>
            <p className="text-sm">{formatInr(l.priceInr * l.qty)}</p></li>))}</ul>}
      </div>
      {lines.length > 0 && <div className="border-t border-champagne/60 p-5 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatInr(subtotal)}</span></div>
        <p className="mt-1 text-xs text-espresso/60">Shipping and discount codes are applied at checkout.</p>
        <Link href="/checkout" onClick={() => setOpen(false)} className="mt-4 block bg-espresso py-3 text-center text-ivory hover:bg-ink transition-colors">Continue to checkout</Link></div>}
    </aside></div>);
}
