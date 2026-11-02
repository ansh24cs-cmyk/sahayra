import { test } from "node:test"; import assert from "node:assert/strict";
import { createLimiter, clientIp } from "../lib/security/rateLimit.ts"; import { hmacHex, verifyRazorpayPayment, verifyRazorpayWebhook, verifySharedToken } from "../lib/security/signature.ts";
test("limiter: allows up to the limit, then blocks with Retry-After, then resets", () => {
  let t = 1000; const l = createLimiter(() => t); const r = { limit: 3, windowMs: 10_000 };
  assert.ok(l.check("a", r).ok && l.check("a", r).ok && l.check("a", r).ok); const b = l.check("a", r); assert.equal(b.ok, false); assert.equal(b.retryAfterSec, 10);
  t += 4000; assert.equal(l.check("a", r).retryAfterSec, 6); t += 6000; assert.ok(l.check("a", r).ok);
});
test("limiter: keys are independent", () => { const l = createLimiter(() => 0); const r = { limit: 1, windowMs: 1000 }; assert.ok(l.check("ip:1", r).ok); assert.ok(!l.check("ip:1", r).ok); assert.ok(l.check("ip:2", r).ok); });
test("limiter: memory is bounded", () => { const l = createLimiter(() => 0); for (let i = 0; i < 10_050; i++) l.check(`k${i}`, { limit: 1, windowMs: 1000 }); assert.ok(l.check("fresh", { limit: 1, windowMs: 1000 }).ok); });
test("clientIp takes the first forwarded address", () => { assert.equal(clientIp("1.2.3.4, 10.0.0.1", null), "1.2.3.4"); assert.equal(clientIp(null, "5.6.7.8"), "5.6.7.8"); assert.equal(clientIp(null, null), "unknown"); });
test("hmac matches the standard SHA-256 test vector", () => assert.equal(hmacHex("The quick brown fox jumps over the lazy dog", "key"), "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"));
test("razorpay payment signature: valid passes; tampering, wrong secret, empty values fail", () => {
  const sig = hmacHex("order_1|pay_1", "s3cret"); assert.ok(verifyRazorpayPayment("order_1", "pay_1", sig, "s3cret"));
  assert.ok(!verifyRazorpayPayment("order_1", "pay_2", sig, "s3cret")); assert.ok(!verifyRazorpayPayment("order_2", "pay_1", sig, "s3cret")); assert.ok(!verifyRazorpayPayment("order_1", "pay_1", sig, "other"));
  assert.ok(!verifyRazorpayPayment("order_1", "pay_1", "", "s3cret")); assert.ok(!verifyRazorpayPayment("order_1", "pay_1", sig, "")); assert.ok(!verifyRazorpayPayment("order_1", "pay_1", sig.slice(0, 10), "s3cret"));
});
test("razorpay webhook: raw body must match byte for byte", () => {
  const body = '{"event":"payment.captured","payload":{}}'; const sig = hmacHex(body, "whsec"); assert.ok(verifyRazorpayWebhook(body, sig, "whsec"));
  assert.ok(!verifyRazorpayWebhook(body.replace("captured", "failed"), sig, "whsec")); assert.ok(!verifyRazorpayWebhook(JSON.stringify(JSON.parse(body), null, 2), sig, "whsec")); assert.ok(!verifyRazorpayWebhook(body, null, "whsec")); assert.ok(!verifyRazorpayWebhook(body, sig, undefined));
});
test("shared token: constant-time compare; missing config or header denies", () => { assert.ok(verifySharedToken("abc123", "abc123")); assert.ok(!verifySharedToken("abc124", "abc123")); assert.ok(!verifySharedToken("abc", "abc123")); assert.ok(!verifySharedToken(null, "abc123")); assert.ok(!verifySharedToken("x", undefined)); });
