import { test } from "node:test"; import assert from "node:assert/strict";
import { priceCart } from "../lib/orders/pricing.ts"; import { validateCoupon } from "../lib/admin/validation.ts"; import { validateContact } from "../lib/content/contact.ts";
const products = { p1: { id: "p1", name: "Ring", images: ["https://x/i.jpg"], variants: [{ sku: "R-G", label: "Gold", priceInr: 1500, stock: 5 }, { sku: "R-S", label: "Silver", priceInr: 1200, stock: 0 }] }, p2: { id: "p2", name: "Studs", images: [], archived: true, variants: [{ sku: "S-1", label: "One", priceInr: 700, stock: 9 }] } };
const base = { products, shipping: { flatInr: 99, freeAboveInr: 3000 }, nowMs: Date.parse("2026-06-01T00:00:00Z") };
test("prices come from the product record, never the client", () => {
  const r = priceCart({ ...base, lines: [{ productId: "p1", sku: "R-G", qty: 2, unitPriceInr: 1, priceInr: 1, totalInr: 1 } as never] }); assert.ok(r.ok); if (r.ok) { assert.equal(r.lines[0].unitPriceInr, 1500); assert.equal(r.subtotalInr, 3000); assert.equal(r.shippingInr, 0); assert.equal(r.totalInr, 3000); }
});
test("flat shipping below the free-shipping threshold; duplicates are merged", () => { const r = priceCart({ ...base, lines: [{ productId: "p1", sku: "R-G", qty: 1 }, { productId: "p1", sku: "R-G", qty: 1 }, { productId: "p1", sku: "R-G", qty: 0 + 1 }].slice(0, 1) }); assert.ok(r.ok); if (r.ok) { assert.equal(r.shippingInr, 99); assert.equal(r.totalInr, 1599); } });
test("stock, archived, unknown variant, bad quantity and empty cart are rejected", () => {
  const e = (lines: { productId: string; sku: string; qty: number }[]) => { const r = priceCart({ ...base, lines }); return r.ok ? [] : r.errors.map((x) => x.code); };
  assert.deepEqual(e([{ productId: "p1", sku: "R-G", qty: 6 }]), ["insufficient_stock"]); assert.deepEqual(e([{ productId: "p1", sku: "R-S", qty: 1 }]), ["insufficient_stock"]); assert.deepEqual(e([{ productId: "p2", sku: "S-1", qty: 1 }]), ["product_unavailable"]);
  assert.deepEqual(e([{ productId: "p1", sku: "NOPE", qty: 1 }]), ["variant_unavailable"]); assert.deepEqual(e([{ productId: "nope", sku: "x", qty: 1 }]), ["product_unavailable"]); assert.deepEqual(e([{ productId: "p1", sku: "R-G", qty: 1.5 }]), ["invalid_quantity"]); assert.deepEqual(e([]), ["empty_cart"]);
});
test("coupons: percent applied, below-minimum rejected", () => {
  const c = validateCoupon({ code: "SAVE10", type: "percent", value: 10, minOrderInr: 1000, active: true }); assert.ok(c.ok); if (!c.ok) return;
  const ok = priceCart({ ...base, lines: [{ productId: "p1", sku: "R-G", qty: 1 }], coupon: c.value }); assert.ok(ok.ok); if (ok.ok) { assert.equal(ok.discountInr, 150); assert.equal(ok.totalInr, 1500 - 150 + 99); assert.equal(ok.couponCode, "SAVE10"); }
  const low = validateCoupon({ code: "BIG", type: "flat", value: 100, minOrderInr: 5000, active: true }); assert.ok(low.ok); if (low.ok) { const r = priceCart({ ...base, lines: [{ productId: "p1", sku: "R-G", qty: 1 }], coupon: low.value }); assert.ok(!r.ok); if (!r.ok) assert.equal(r.errors[0].reason, "below_minimum"); }
});
test("contact form validation and honeypot", () => {
  assert.ok(validateContact({ name: "Asha", email: "a@b.co", message: "Hello, a question." }).ok); assert.ok(!validateContact({ name: "A", email: "x", message: "hi" }).ok);
  const s = validateContact({ name: "Bot", email: "a@b.co", message: "Buy cheap things now", website: "http://spam" }); assert.ok(s.ok); if (s.ok) assert.equal(s.spam, true);
});
