import "server-only";
import { adminDb } from "@/lib/firebase/admin"; import { HttpError } from "./guard"; import { priceCart, type PricingProduct } from "@/lib/orders/pricing"; import { validateCoupon } from "@/lib/admin/validation";
const ID = /^[A-Za-z0-9_-]{1,64}$/;
/** Returns verified prices, stock checks, coupon and shipping. Nothing here trusts a price, total or discount from the browser. */
export async function quoteCart(uid: string, body: unknown) {
  const b = (body ?? {}) as { lines?: unknown; couponCode?: unknown; addressId?: unknown }; const db = adminDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lines = (Array.isArray(b.lines) ? b.lines.slice(0, 50) : []).map((x: any) => ({ productId: String(x?.productId ?? ""), sku: String(x?.sku ?? ""), qty: Number(x?.qty) }));
  const ids = [...new Set(lines.map((l) => l.productId).filter((id) => ID.test(id)))];
  const snaps = ids.length ? await db.getAll(...ids.map((id) => db.collection("products").doc(id))) : [];
  const products: Record<string, PricingProduct> = Object.fromEntries(snaps.filter((s) => s.exists).map((s) => [s.id, { id: s.id, name: String(s.data()!.name), archived: s.data()!.archived === true, images: s.data()!.images ?? [], variants: s.data()!.variants ?? [] }]));
  const code = typeof b.couponCode === "string" ? b.couponCode.trim().toUpperCase() : ""; let coupon = null;
  if (code) { const s = ID.test(code) ? await db.collection("coupons").doc(code).get() : null; const v = s?.exists ? validateCoupon(s.data()) : null;
    if (!v || !v.ok) throw new HttpError(400, "validation", { couponCode: "This code isn't valid." }); coupon = v.value; }
  if (typeof b.addressId === "string" && b.addressId) { if (!ID.test(b.addressId) || !(await db.collection("users").doc(uid).collection("addresses").doc(b.addressId).get()).exists) throw new HttpError(400, "validation", { addressId: "Choose one of your saved addresses." }); }
  const st = (await db.collection("settings").doc("store").get()).data() ?? {};
  return priceCart({ lines, products, coupon, couponUses: 0 /* usage counting arrives with order creation */, shipping: { flatInr: Number(st.shippingFlatInr ?? 0), freeAboveInr: st.freeShippingAboveInr ?? null }, nowMs: Date.now() });
}
