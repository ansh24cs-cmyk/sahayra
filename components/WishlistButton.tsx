"use client";
import { useRouter, usePathname } from "next/navigation"; import { useWishlist } from "@/context/WishlistContext";
export default function WishlistButton({ productId, name }: { productId: string; name: string }) {
  const { has, toggle, canUse } = useWishlist(); const router = useRouter(); const path = usePathname(); const on = has(productId);
  return (<button type="button" aria-pressed={on} aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
    onClick={() => (canUse ? toggle(productId) : router.push(`/login?next=${encodeURIComponent(path)}`))}
    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/90 text-espresso transition-colors hover:text-gold">
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" /></svg></button>);
}
