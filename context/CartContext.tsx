"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartLine } from "@/lib/types";
const KEY = "sahayra.cart.v1";
interface Ctx { lines: CartLine[]; count: number; subtotal: number; open: boolean; setOpen(v: boolean): void;
  add(l: Omit<CartLine, "qty">, qty?: number): void; setQty(sku: string, qty: number): void; remove(sku: string): void; clear(): void }
const CartCtx = createContext<Ctx | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [open, setOpen] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, ready]); // TODO: sync to Firestore when signed in
  const add = useCallback((l: Omit<CartLine, "qty">, qty = 1) => { setLines((p) => p.some((x) => x.sku === l.sku) ? p.map((x) => x.sku === l.sku ? { ...x, qty: x.qty + qty } : x) : [...p, { ...l, qty }]); setOpen(true); }, []);
  const setQty = useCallback((sku: string, qty: number) => setLines((p) => qty < 1 ? p.filter((x) => x.sku !== sku) : p.map((x) => x.sku === sku ? { ...x, qty } : x)), []);
  const remove = useCallback((sku: string) => setLines((p) => p.filter((x) => x.sku !== sku)), []);
  const clear = useCallback(() => setLines([]), []);
  const value = useMemo(() => ({ lines, open, setOpen, add, setQty, remove, clear,
    count: lines.reduce((n, l) => n + l.qty, 0), subtotal: lines.reduce((n, l) => n + l.qty * l.priceInr, 0) }), [lines, open, add, setQty, remove, clear]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => { const c = useContext(CartCtx); if (!c) throw new Error("CartProvider missing"); return c; };
