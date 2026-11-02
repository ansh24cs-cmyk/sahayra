"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext"; import { authedFetch } from "@/lib/auth/clientFetch"; import type { Product } from "@/lib/types";
const Ctx = createContext<{ has(id: string): boolean; toggle(id: string): Promise<void>; canUse: boolean }>({ has: () => false, toggle: async () => {}, canUse: false });
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth(); const [ids, setIds] = useState<Set<string>>(new Set()); const canUse = status === "signed-in";
  useEffect(() => { if (!canUse) return setIds(new Set()); authedFetch<{ items: Product[] }>("/api/account/wishlist").then((r) => setIds(new Set(r.items.map((p) => p.id)))).catch(() => {}); }, [canUse]);
  const toggle = useCallback(async (id: string) => {
    const had = ids.has(id); const next = new Set(ids); had ? next.delete(id) : next.add(id); setIds(next);
    try { await (had ? authedFetch(`/api/account/wishlist/${id}`, { method: "DELETE" }) : authedFetch("/api/account/wishlist", { method: "POST", json: { productId: id } })); }
    catch { setIds(ids); } // roll back
  }, [ids]);
  const v = useMemo(() => ({ has: (id: string) => ids.has(id), toggle, canUse }), [ids, toggle, canUse]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useWishlist = () => useContext(Ctx);
