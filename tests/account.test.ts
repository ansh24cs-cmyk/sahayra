import { test } from "node:test"; import assert from "node:assert/strict";
import { validateAddress } from "../lib/account/validation.ts"; import { sameOrigin } from "../lib/auth/csrf.ts"; import { buildOrderRecord, generateOrderNumber } from "../lib/orders/snapshot.ts";
const good = { fullName: "Asha Rao", phone: "+91 98765 43210", line1: "12 MG Road", line2: "", landmark: "", city: "Pune", state: "Maharashtra", pincode: "411001", country: "India", label: "Home" };
test("address: valid input is normalised", () => { const r = validateAddress(good); assert.ok(r.ok); if (r.ok) assert.equal(r.value.phone, "9876543210"); });
test("address: rejects bad PIN, phone, label, missing city", () => {
  const r = validateAddress({ ...good, pincode: "011001", phone: "12345", label: "Office", city: "" }); assert.ok(!r.ok);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ["city", "label", "phone", "pincode"]);
});
test("address: mass-assignment fields are dropped", () => { const r = validateAddress({ ...good, isDefault: true, role: "admin", userId: "x" }); assert.ok(r.ok); if (r.ok) { assert.equal("isDefault" in r.value, false); assert.equal("role" in r.value, false); } });
test("address: non-India country and non-object input rejected", () => { assert.ok(!validateAddress({ ...good, country: "UK" }).ok); assert.ok(!validateAddress(null).ok); });
test("csrf: cookie mutations need same origin", () => {
  const b = { method: "POST", host: "shop.in", hasBearer: false, secFetchSite: null as string | null };
  assert.equal(sameOrigin({ ...b, origin: "https://shop.in" }), true); assert.equal(sameOrigin({ ...b, origin: "https://evil.com" }), false);
  assert.equal(sameOrigin({ ...b, origin: null }), false); assert.equal(sameOrigin({ ...b, origin: null, secFetchSite: "same-origin" }), true);
  assert.equal(sameOrigin({ ...b, origin: "https://evil.com", hasBearer: true }), true); assert.equal(sameOrigin({ ...b, method: "GET", origin: "https://evil.com" }), true);
});
const addr = () => { const r = validateAddress(good); if (!r.ok) throw new Error("bad fixture"); return r.value; };
test("order: totals computed server-side and snapshot is decoupled", () => {
  const lines = [{ productId: "p1", name: "Ring", sku: "R-1", unitPriceInr: 1500, qty: 2 }, { productId: "p2", name: "Studs", sku: "E-1", unitPriceInr: 700, qty: 1 }]; const a = addr();
  const o = buildOrderRecord({ id: "o1", orderNumber: "SAH-20260101-ABC123", userId: "u1", lines, discountInr: 200, shippingInr: 100, shippingAddress: a, billingAddress: a, now: "2026-01-01T00:00:00Z" });
  assert.equal(o.subtotalInr, 3700); assert.equal(o.totalInr, 3600); assert.equal(o.fulfilmentStatus, "pending"); assert.equal(o.payment.status, "pending"); assert.equal(o.history[0].status, "pending");
  lines[0].name = "CHANGED"; lines[0].unitPriceInr = 1; a.city = "Elsewhere"; assert.equal(o.lines[0].name, "Ring"); assert.equal(o.lines[0].unitPriceInr, 1500); assert.equal(o.shippingAddress.city, "Pune");
});
test("order: rejects bad quantities, prices, discounts, empty orders", () => {
  const a = addr(), base = { id: "o", orderNumber: "n", userId: "u", shippingAddress: a, billingAddress: a, now: "t" }, l = { productId: "p", name: "n", sku: "s", unitPriceInr: 100, qty: 1 };
  assert.throws(() => buildOrderRecord({ ...base, lines: [] })); assert.throws(() => buildOrderRecord({ ...base, lines: [{ ...l, qty: 0 }] }));
  assert.throws(() => buildOrderRecord({ ...base, lines: [{ ...l, unitPriceInr: 9.5 }] })); assert.throws(() => buildOrderRecord({ ...base, lines: [l], discountInr: 101 }));
});
test("order number format", () => assert.match(generateOrderNumber(new Date("2026-03-05T10:00:00Z")), /^SAH-20260305-[A-Z0-9]{6}$/));
