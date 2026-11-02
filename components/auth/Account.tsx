"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth/service";
import EmptyState from "@/components/EmptyState";
export function AccountNav() {
  const p = usePathname(); const router = useRouter();
  const tabs = [["/account", "Overview"], ["/account/profile", "Profile"], ["/account/addresses", "Addresses"], ["/account/orders", "Orders"], ["/account/wishlist", "Wishlist"]];
  return (<nav aria-label="Account" className="mb-10 flex flex-wrap items-center gap-6 border-b border-champagne/60 pb-3 text-sm">
    {tabs.map(([h, n]) => <Link key={h} href={h} aria-current={p === h ? "page" : undefined} className={p === h ? "text-gold underline underline-offset-8" : ""}>{n}</Link>)}
    <button className="ml-auto underline" onClick={async () => { await signOutUser(); router.replace("/"); }}>Sign out</button></nav>);
}
export function Overview() { const { user } = useAuth(); return (<><h1 className="font-serif text-4xl">Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1><p className="mt-3 text-sm text-espresso/70">Manage your details, addresses and orders here.</p></>); }
