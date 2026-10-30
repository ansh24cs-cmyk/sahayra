import type { Order, Paged, Product, ProductQuery } from "./types";
/** Browser-side service layer. Server components use lib/server/* directly. */
export async function getProducts(q: ProductQuery = {}): Promise<Paged<Product>> {
  if (typeof window === "undefined") throw new Error("getProducts is browser-only. In server components import queryProducts from \"@/lib/server/products\" instead.");
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q); if (q.category) p.set("category", q.category); if (q.maxPrice) p.set("max", String(q.maxPrice));
  if (q.inStock) p.set("stock", "1"); if (q.sort) p.set("sort", q.sort); if (q.page) p.set("page", String(q.page));
  const r = await fetch(`/api/products?${p}`); if (!r.ok) throw new Error("products_unavailable"); return r.json();
}
export async function getProduct(_slug: string): Promise<Product | null> { return null; }
export async function createRazorpayOrder(_amountInr: number): Promise<{ orderId: string }> {
  // TODO(razorpay): POST /api/payments/order (server creates order using secret key).
  throw new Error("Payments are not connected yet.");
}
export async function getOrder(_id: string): Promise<Order | null> {
  // TODO(shiprocket): server syncs courier events into Firestore; read them here. No simulated events.
  return null;
}
export async function checkPincode(_pin: string): Promise<{ serviceable: boolean; etaDays?: number } | null> {
  // TODO(shiprocket): serviceability API via server route.
  return null;
}
