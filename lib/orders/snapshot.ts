import type { AddressInput, OrderLine, OrderRecord } from "../types";
export interface LineInput { productId: string; name: string; sku: string; image?: string; variantLabel?: string; unitPriceInr: number; qty: number }
export function generateOrderNumber(now = new Date(), rand: () => number = Math.random): string {
  const d = now.toISOString().slice(0, 10).replaceAll("-", ""); let t = ""; while (t.length < 6) t += Math.floor(rand() * 36).toString(36).toUpperCase(); return `SAH-${d}-${t}`;
}
/** Totals are computed here from the lines; client-supplied totals are never accepted. Everything is deep-copied so later product/address edits can't change history. */
export function buildOrderRecord(i: { id: string; orderNumber: string; userId: string; lines: LineInput[]; discountInr?: number; shippingInr?: number; taxInr?: number; shippingAddress: AddressInput; billingAddress: AddressInput; now: string }): OrderRecord {
  if (!i.lines.length) throw new Error("An order needs at least one line.");
  const lines: OrderLine[] = i.lines.map((l) => {
    if (!Number.isInteger(l.unitPriceInr) || l.unitPriceInr < 0) throw new Error("Invalid unit price.");
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 20) throw new Error("Invalid quantity.");
    return { ...structuredClone(l), lineTotalInr: l.unitPriceInr * l.qty };
  });
  const subtotal = lines.reduce((n, l) => n + l.lineTotalInr, 0); const discount = i.discountInr ?? 0, shipping = i.shippingInr ?? 0, tax = i.taxInr ?? 0;
  for (const n of [discount, shipping, tax]) if (!Number.isInteger(n) || n < 0) throw new Error("Invalid amount.");
  if (discount > subtotal) throw new Error("Discount cannot exceed the subtotal.");
  return { id: i.id, orderNumber: i.orderNumber, userId: i.userId, lines, subtotalInr: subtotal, discountInr: discount, shippingInr: shipping, taxInr: tax, totalInr: subtotal - discount + shipping + tax, currency: "INR",
    shippingAddress: structuredClone(i.shippingAddress), billingAddress: structuredClone(i.billingAddress), payment: { provider: null, status: "pending" }, fulfilmentStatus: "pending",
    history: [{ status: "pending", at: i.now, note: "Order created" }], createdAt: i.now, updatedAt: i.now };
}
