"use client";
import Link from "next/link"; import { usePathname, useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth/service";
const items = [["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/inventory", "Inventory"], ["/admin/orders", "Orders"], ["/admin/customers", "Customers"], ["/admin/settings", "Settings"]];
export default function AdminNav() {
  const p = usePathname(); const r = useRouter();
  return (<aside className="border-b border-champagne/60 p-5 md:min-h-screen md:w-56 md:border-b-0 md:border-r"><p className="mb-6 font-serif text-2xl text-gold">Sahayra admin</p>
    <nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:flex-col">{items.map(([h, n]) => <Link key={h} href={h} aria-current={p === h ? "page" : undefined} className={p === h ? "text-gold" : "hover:text-gold"}>{n}</Link>)}</nav>
    <button className="mt-6 text-sm underline" onClick={async () => { await signOutUser(); r.replace("/admin/login"); r.refresh(); }}>Sign out</button></aside>);
}
