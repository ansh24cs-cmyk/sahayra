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
export function Profile() { const { user } = useAuth(); return (<><h1 className="font-serif text-4xl">Profile</h1><dl className="mt-6 space-y-3 text-sm"><div><dt className="text-espresso/60">Name</dt><dd>{user?.displayName ?? "Not set"}</dd></div><div><dt className="text-espresso/60">Email</dt><dd>{user?.email} ({user?.emailVerified ? "verified" : "not verified"})</dd></div></dl></>); }
export const Addresses = () => <><h1 className="mb-6 font-serif text-4xl">Saved addresses</h1><EmptyState title="No saved addresses" body="Address saving arrives with checkout, once Firestore is connected." /></>;
export const Orders = () => <><h1 className="mb-6 font-serif text-4xl">Orders</h1><EmptyState title="No orders yet" body="Your orders will appear here after your first purchase." href="/shop" cta="Browse jewellery" /></>;
export const Wishlist = () => <><h1 className="mb-6 font-serif text-4xl">Wishlist</h1><EmptyState title="Your wishlist is empty" body="Saved pieces will appear here." href="/shop" cta="Browse jewellery" /></>;
