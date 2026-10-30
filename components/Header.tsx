"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Logo from "@/components/Logo";
import { CATEGORIES } from "@/lib/categories";
export default function Header() {
  const { count, setOpen } = useCart(); const router = useRouter(); const [menu, setMenu] = useState(false); const [q, setQ] = useState(""); const [find, setFind] = useState(false);
  const go = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { router.push(`/shop?q=${encodeURIComponent(q.trim())}`); setFind(false); } };
  return (<header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-sm border-b border-champagne/50">
    <p className="bg-espresso py-1.5 text-center text-xs text-ivory">You deserve this</p>
    <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-5">
      <button className="md:hidden text-sm" aria-expanded={menu} onClick={() => setMenu(!menu)}>Menu</button>
      <Logo />
      <nav aria-label="Main" className="hidden md:flex gap-8 text-sm">
        <div className="group relative"><Link href="/shop" className="py-5 inline-block">Shop</Link>
          <ul className="invisible absolute left-0 top-full w-48 border border-champagne/60 bg-ivory p-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {CATEGORIES.map(([s, n]) => <li key={s}><Link className="block py-1.5 hover:text-gold" href={`/shop?category=${s}`}>{n}</Link></li>)}</ul></div>
        <Link href="/about" className="py-5">Our story</Link><Link href="/care" className="py-5">Jewellery care</Link><Link href="/contact" className="py-5">Contact</Link>
      </nav>
      <div className="flex items-center gap-4 text-sm">
        <button onClick={() => setFind(!find)} aria-expanded={find}>Search</button>
        <Link href="/account/wishlist" className="hidden sm:inline">Wishlist</Link><Link href="/account" className="hidden sm:inline">Account</Link>
        <button onClick={() => setOpen(true)}>Bag ({count})</button></div>
    </div>
    {find && <form onSubmit={go} role="search" className="border-t border-champagne/50 px-5 py-3"><label className="sr-only" htmlFor="s">Search jewellery</label>
      <input id="s" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or material" className="mx-auto block w-full max-w-xl border-b border-espresso bg-transparent py-2 outline-none" /></form>}
    {menu && <nav aria-label="Mobile" className="md:hidden border-t border-champagne/50 p-5 text-sm space-y-3">
      <Link href="/shop" onClick={() => setMenu(false)} className="block">All jewellery</Link>
      {CATEGORIES.map(([s, n]) => <Link key={s} onClick={() => setMenu(false)} className="block pl-4 text-espresso/70" href={`/shop?category=${s}`}>{n}</Link>)}
      <Link href="/about" className="block">Our story</Link><Link href="/account" className="block">Account</Link><Link href="/contact" className="block">Contact</Link></nav>}
  </header>);
}
