import { evaluateCoupon } from "../admin/validation.ts"; import type { CouponValue } from "../admin/validation.ts"; import type { LineInput } from "./snapshot.ts";
export interface PricingProduct { id: string; name: string; archived?: boolean; images: string[]; variants: { sku: string; label: string; priceInr: number; stock: number }[] }
export type PriceError = { code: "empty_cart" | "invalid_quantity" | "product_unavailable" | "variant_unavailable" | "insufficient_stock" | "coupon_invalid"; sku?: string; available?: number; reason?: string };
export type Priced = { ok: true; lines: LineInput[]; subtotalInr: number; discountInr: number; shippingInr: number; taxInr: number; totalInr: number; couponCode: string | null } | { ok: false; errors: PriceError[] };
/** The ONLY source of prices is the product record. The client may send only product, SKU and quantity. Prices are inclusive of any taxes, so taxInr is 0. */
export function priceCart(i: { lines: { productId: string; sku: string; qty: number }[]; products: Record<string, PricingProduct | undefined>; coupon?: CouponValue | null; couponUses?: number; shipping: { flatInr: number; freeAboveInr: number | null }; nowMs: number }): Priced {
  if (!i.lines.length) return { ok: false, errors: [{ code: "empty_cart" }] };
  const errors: PriceError[] = []; const merged = new Map<string, { productId: string; sku: string; qty: number }>();
  for (const l of i.lines) { if (!Number.isInteger(l.qty) || l.qty < 1) { errors.push({ code: "invalid_quantity", sku: l.sku }); continue; } const k = `${l.productId}:${l.sku}`; const m = merged.get(k); merged.set(k, { productId: l.productId, sku: l.sku, qty: (m?.qty ?? 0) + l.qty }); }
  const lines: LineInput[] = [];
  for (const l of merged.values()) {
    if (l.qty > 10) { errors.push({ code: "invalid_quantity", sku: l.sku }); continue; }
    const p = i.products[l.productId]; if (!p || p.archived) { errors.push({ code: "product_unavailable", sku: l.sku }); continue; }
    const v = p.variants.find((x) => x.sku === l.sku); if (!v) { errors.push({ code: "variant_unavailable", sku: l.sku }); continue; }
    if (l.qty > v.stock) { errors.push({ code: "insufficient_stock", sku: l.sku, available: v.stock }); continue; }
    lines.push({ productId: p.id, name: p.name, sku: v.sku, image: p.images[0], variantLabel: v.label, unitPriceInr: v.priceInr, qty: l.qty });
  }
  if (errors.length) return { ok: false, errors };
  const subtotal = lines.reduce((n, l) => n + l.unitPriceInr * l.qty, 0); let discount = 0, couponCode: string | null = null;
  if (i.coupon) { const r = evaluateCoupon(i.coupon, subtotal, i.nowMs, i.couponUses ?? 0); if (!r.ok) return { ok: false, errors: [{ code: "coupon_invalid", reason: r.reason }] }; discount = r.discountInr; couponCode = i.coupon.code; }
  const shipping = i.shipping.freeAboveInr !== null && subtotal >= i.shipping.freeAboveInr ? 0 : i.shipping.flatInr;
  return { ok: true, lines, subtotalInr: subtotal, discountInr: discount, shippingInr: shipping, taxInr: 0, totalInr: subtotal - discount + shipping, couponCode };
}
