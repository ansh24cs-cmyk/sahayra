import { createHmac, timingSafeEqual } from "node:crypto";
const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const hmacHex = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("hex");
/** Razorpay Checkout: HMAC_SHA256(order_id + "|" + payment_id, key_secret) must equal the signature the browser sends. */
export const verifyRazorpayPayment = (orderId: string, paymentId: string, signature: string, secret: string) => !!secret && !!signature && eq(hmacHex(`${orderId}|${paymentId}`, secret), signature);
/** Razorpay webhook: HMAC_SHA256(RAW request body, webhook secret) must equal X-Razorpay-Signature. Never verify re-serialised JSON. */
export const verifyRazorpayWebhook = (rawBody: string, signature: string | null, secret: string | undefined) => !!secret && !!signature && eq(hmacHex(rawBody, secret), signature);
/** Shared-secret header check in constant time (e.g. a Shiprocket webhook token; confirm the exact header name in their docs). */
export const verifySharedToken = (given: string | null, expected: string | undefined) => !!expected && !!given && eq(given, expected);
