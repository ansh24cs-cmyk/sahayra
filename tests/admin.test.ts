import { test } from "node:test"; import assert from "node:assert/strict";
import { validateProduct, validateCategory, validateCoupon, evaluateCoupon, validateBanner, validateSettings, validateStatusUpdate, nextStatuses, slugify } from "../lib/admin/validation.ts";
import { validateProfile } from "../lib/account/validation.ts";
const prod = { name: "Aarya Hoops", category: "earrings", material: "925 silver, gold plated", description: "d", images: ["https://x.test/a.jpg"], variants: [{ sku: "AH-G", label: "Gold", priceInr: "1499", stock: "5" }] };
test("slugify", () => assert.equal(slugify("  Crème Brûlée Ring!! "), "creme-brulee-ring"));
test("product: valid, slug generated, numbers coerced", () => { const r = validateProduct(prod); assert.ok(r.ok); if (r.ok) { assert.equal(r.value.slug, "aarya-hoops"); assert.equal(r.value.variants[0].priceInr, 1499); assert.equal(r.value.compareAtInr, null); assert.equal(r.value.archived, false); } });
test("product: field errors for duplicate SKU, negative stock, http image, bad compare-at", () => {
  const r = validateProduct({ ...prod, images: ["http://x.test/a.jpg"], compareAtInr: 1000, variants: [{ sku: "A1", label: "x", priceInr: 1499, stock: -1 }, { sku: "A1", label: "y", priceInr: 2000, stock: 1 }] });
  assert.ok(!r.ok); if (!r.ok) { for (const k of ["images", "compareAtInr", "variants.0.stock", "variants.1.sku"]) assert.ok(r.errors[k], k); }
});
test("product: unknown fields are not carried through", () => { const r = validateProduct({ ...prod, createdAt: "x", isAdmin: true }); assert.ok(r.ok); if (r.ok) assert.deepEqual(Object.keys(r.value).sort(), ["archived", "category", "compareAtInr", "description", "images", "material", "name", "slug", "variants"]); });
test("product: no variants rejected", () => assert.ok(!validateProduct({ ...prod, variants: [] }).ok));
test("category", () => { const r = validateCategory({ name: "Hair Accessories" }); assert.ok(r.ok); if (r.ok) assert.deepEqual(r.value, { name: "Hair Accessories", slug: "hair-accessories", order: 0 }); assert.ok(!validateCategory({ name: "x" }).ok); });
const coupon = { code: "welcome10", type: "percent", value: 10, minOrderInr: 1000, active: true, endsAt: "2026-12-31T00:00:00Z" };
test("coupon: validate and uppercase", () => { const r = validateCoupon(coupon); assert.ok(r.ok); if (r.ok) assert.equal(r.value.code, "WELCOME10"); assert.ok(!validateCoupon({ ...coupon, value: 95 }).ok); assert.ok(!validateCoupon({ ...coupon, startsAt: "2026-12-31T00:00:00Z" }).ok); assert.ok(!validateCoupon({ ...coupon, code: "a b" }).ok); });
test("coupon: evaluation rules", () => {
  const r = validateCoupon({ ...coupon, maxUses: 2 }); assert.ok(r.ok); if (!r.ok) return; const c = r.value, now = Date.parse("2026-06-01T00:00:00Z");
  assert.deepEqual(evaluateCoupon(c, 2000, now), { ok: true, discountInr: 200 }); assert.deepEqual(evaluateCoupon(c, 999, now), { ok: false, reason: "below_minimum" });
  assert.deepEqual(evaluateCoupon(c, 2000, Date.parse("2027-01-01T00:00:00Z")), { ok: false, reason: "expired" }); assert.deepEqual(evaluateCoupon(c, 2000, now, 2), { ok: false, reason: "used_up" });
  assert.deepEqual(evaluateCoupon({ ...c, active: false }, 2000, now), { ok: false, reason: "inactive" }); assert.deepEqual(evaluateCoupon({ ...c, type: "flat", value: 5000, minOrderInr: 0 }, 2000, now), { ok: true, discountInr: 2000 });
});
test("banner: only internal links and https images", () => { assert.ok(validateBanner({ title: "Festive", href: "/shop" }).ok); assert.ok(!validateBanner({ title: "x1", href: "//evil.com" }).ok); assert.ok(!validateBanner({ title: "x1", href: "https://evil.com" }).ok); assert.ok(!validateBanner({ title: "ok", imageUrl: "http://a.b/c.png" }).ok); });
test("settings", () => { assert.ok(validateSettings({ storeName: "Sahayra", shippingFlatInr: 99, supportEmail: "a@b.co" }).ok); assert.ok(!validateSettings({ storeName: "S", supportEmail: "bad" }).ok); });
test("order status: only forward transitions", () => {
  assert.deepEqual(nextStatuses("pending"), ["processing", "cancelled"]); assert.deepEqual(nextStatuses("delivered"), []); assert.ok(!validateStatusUpdate({ status: "delivered" }, "pending").ok); assert.ok(!validateStatusUpdate({ status: "pending" }, "shipped").ok);
  assert.ok(validateStatusUpdate({ status: "packed" }, "processing").ok);
});
test("order status: shipping needs courier and AWB (Shiprocket-ready)", () => {
  assert.ok(!validateStatusUpdate({ status: "shipped" }, "packed").ok); const r = validateStatusUpdate({ status: "shipped", courier: "Delhivery", awb: "DL123456", estimatedDelivery: "2026-06-10" }, "packed");
  assert.ok(r.ok); if (r.ok) assert.deepEqual(r.value.shipment, { courier: "Delhivery", awb: "DL123456", estimatedDelivery: "2026-06-10" });
});
test("profile", () => { assert.ok(validateProfile({ displayName: "Asha Rao", phone: "" }).ok); const r = validateProfile({ displayName: "Asha Rao", phone: "+91 98765 43210" }); assert.ok(r.ok); if (r.ok) assert.equal(r.value.phone, "9876543210"); assert.ok(!validateProfile({ displayName: "A", phone: "123" }).ok); });
