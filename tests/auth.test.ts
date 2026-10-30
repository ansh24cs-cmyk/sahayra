import { test } from "node:test"; import assert from "node:assert/strict";
import { validateSignup, validateLogin, validateEmail, safeRedirect, passwordIssues } from "../lib/auth/validation.ts";
import { evaluateAdmin, decisionStatus } from "../lib/auth/adminPolicy.ts";
const ok = { name: "Asha Rao", email: "asha@example.com", password: "Gold1ring99x", confirm: "Gold1ring99x", terms: true };
test("signup accepts valid input", () => assert.deepEqual(validateSignup(ok), {}));
test("signup rejects mismatch, weak password, bad email, no terms", () => {
  const e = validateSignup({ ...ok, email: "nope", password: "short", confirm: "other", terms: false });
  assert.ok(e.email && e.password && e.confirm && e.terms);
});
test("password rules", () => { assert.equal(passwordIssues("Gold1ring99x").length, 0); assert.ok(passwordIssues("alllowercase1").includes("an uppercase letter")); });
test("login/email validation", () => { assert.ok(validateLogin({ email: "", password: "" }).email); assert.equal(validateEmail("a@b.co"), null); });
test("safeRedirect blocks open redirects", () => {
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "/a://b", "", null]) assert.equal(safeRedirect(bad as string), "/account");
  assert.equal(safeRedirect("/account/orders"), "/account/orders");
});
test("admin policy denies by default", () => {
  assert.equal(evaluateAdmin(null, "u1", false), "misconfigured");
  assert.equal(evaluateAdmin({ uid: "u1", admin: true }, undefined, true), "misconfigured");
  assert.equal(evaluateAdmin(null, "u1", true), "unauthenticated");
  assert.equal(evaluateAdmin({ uid: "u2", admin: true }, "u1", true), "forbidden");
  assert.equal(evaluateAdmin({ uid: "u1" }, "u1", true), "forbidden");
  assert.equal(evaluateAdmin({ uid: "u1", admin: "true" }, "u1", true), "forbidden");
  assert.equal(evaluateAdmin({ uid: "u1", admin: true }, "u1", true), "ok");
  assert.deepEqual([401, 403, 503, 200], (["unauthenticated", "forbidden", "misconfigured", "ok"] as const).map(decisionStatus));
});
import { applyQuery } from "../lib/products/filter.ts";
const prod = (id: string, price: number, stock: number, cat = "rings", at = "2026-01-01") => ({ id, slug: id, name: id, category: cat, material: "gold", images: [], variants: [{ sku: id, label: "s", priceInr: price, stock }], createdAt: at }) as never;
test("applyQuery filters, sorts and hides archived", () => {
  const all = [prod("a", 500, 1), prod("b", 900, 0, "rings", "2026-02-01"), prod("c", 700, 3, "earrings"), { ...(prod("d", 100, 1) as object), archived: true } as never];
  assert.equal(applyQuery(all, {}).total, 3);
  assert.deepEqual(applyQuery(all, { sort: "low" }).items.map((p) => p.id), ["a", "c", "b"]);
  assert.deepEqual(applyQuery(all, { inStock: true, category: "rings" }).items.map((p) => p.id), ["a"]);
  assert.deepEqual(applyQuery(all, { maxPrice: 600 }).items.map((p) => p.id), ["a"]);
  assert.deepEqual(applyQuery(all, { sort: "new" }).items.map((p) => p.id)[0], "b");
});
