# Sahayra security audit

Scope: Next.js app, Firebase Auth, Firestore, Storage, Admin SDK, all API routes. Method: reading the source, targeted greps, `scripts/check-security.mjs` (static), unit tests. **No penetration test, emulator run, live Firebase test, browser test or `npm audit` was performed.** Nothing was deployed and no credential was changed.

Legend, Tested: **Unit** = a unit test of the logic passed. **Static** = the static scanner checks it. **Written** = test exists but was NOT run. **None** = reviewed by reading only.

## Findings

| # | Sev | Finding | Files | Status | Tested |
|---|-----|---------|-------|--------|--------|
| 1 | High | Next.js 14.2.15 is below 14.2.25, the fix for CVE-2025-29927 (middleware authorization bypass; vendor-rated Critical). Not exploitable as built (the app uses no middleware), but the dependency must be upgraded and middleware must never be used as the only auth check. | package.json | Manifest changed to `~14.2.25`; **you must `npm install` and run `npm audit`** | None |
| 2 | High | No rate limiting anywhere: contact-form spam, token-verification floods, quote/API abuse, cost amplification. | all routes | Fixed (per-instance limiter, see #14) | Unit (limiter logic) |
| 3 | High | Logout only cleared the cookie; a copied session cookie stayed valid for 5 days. Owner session was also 5 days. | api/auth/session/route.ts | Fixed: logout revokes refresh tokens; owner session 2 h, customers 5 d | None (needs Firebase) |
| 4 | Medium | No CSRF/origin check on `/api/auth/session` (login CSRF, forced logout). | api/auth/session/route.ts | Fixed: same-origin check | Unit (predicate) |
| 5 | Medium | No security headers, no CSP, `X-Powered-By` exposed. | next.config.js (new) | Fixed; **CSP is Report-Only** until you verify it in a browser | Static (presence) |
| 6 | Medium | Firestore rules let the owner write from a browser and had an owner catch-all; `auditLog` was editable by the owner's browser. | firestore.rules | Fixed: all client writes denied, default-deny catch-all | Static; Written (emulator, not run) |
| 7 | Medium | Audit log recorded only successful writes, without IP, and swallowed failures; denied admin attempts were not logged. | lib/server/admin.ts | Fixed | None |
| 8 | Medium | Request bodies unbounded. | lib/server/guard.ts | Fixed: 100 KB cap (10 KB on public routes) | None |
| 9 | Medium | Public `/api/products` scanned the whole collection on every request. | api/products/route.ts | Mitigated: throttle + 30 s CDN cache | None |
| 10 | Medium | Account enumeration (sign-up reveals existing emails) and weak server-side password policy (Firebase default is minimal; my checks run in the browser only). | Firebase console | **Open: console settings, see below** | None |
| 11 | Medium | Owner login has no MFA and relies on Firebase's built-in lockout only. | Firebase console | **Open** | None |
| 12 | Low | `lib/firebase/admin.ts` lacked the `server-only` guard. | lib/firebase/admin.ts | Fixed | Static |
| 13 | Low | `/api/products` exposes exact stock numbers publicly. | lib/server/products.ts | Accepted | None |
| 14 | Low | Rate limiter is in memory, per server instance; IP comes from `X-Forwarded-For`, which is spoofable unless a trusted proxy overwrites it. On serverless it can be bypassed by spreading across instances. | lib/server/limits.ts | **Open: needs a shared store (Upstash/Redis) or Firebase App Check for strong guarantees** | Unit (logic only) |
| 15 | Low | Storage `contentType` is client-asserted metadata; only the owner can upload. | storage.rules | Accepted | Written (not run) |
| 16 | Low | Coupon `maxUses` not enforced; slug-uniqueness race; SKU uniqueness not enforced across products. | admin/validation.ts, adminProducts.ts | Open (checkout phase) | Unit (coupon maths) |
| 17 | Info | `.env.local` is in the zip with PUBLIC Firebase values only. Never add server secrets to a file you share. | .env.local | Note | Static (gitignored) |

## Reviewed and found sound (by reading and static checks, not by attack)

- Every API route is guarded (`withUser`, `withAdmin`, or the admin collection helper) or is on a reviewed public list that is rate-limited. Static scanner enforces this.
- Customer data is scoped by the UID from the verified token (`users/{uid}/...` paths); orders return 404 for other users' ids. Mass assignment is blocked by allow-list validators (unit tested).
- Admin access needs the exact `ADMIN_UID` AND the server-set `admin` claim, denied when config is missing (unit tested). Public sign-up cannot set claims. The provisioning script refuses if another account already holds the claim (untested until Firebase is connected).
- Prices, totals, stock and coupons are recomputed on the server; the browser sends only product, SKU, quantity (unit tested).
- No XSS sinks (`dangerouslySetInnerHTML` etc.); banner links are same-site paths; image URLs must be https; login redirects are validated (unit tested).
- Secrets: server variables are never `NEXT_PUBLIC_`, never read in client files (static).

## Payments and webhooks (future phase): required controls

Helpers exist and are unit tested against a standard HMAC vector, tampering and constant-time comparison: `lib/security/signature.ts`. **No payment or webhook endpoint exists yet.** When built:
1. Create the Razorpay order on the server from the server-computed total (amount x 100); never accept an amount from the browser.
2. Verify `razorpay_signature` with `verifyRazorpayPayment` before marking anything paid; compare the paid amount/currency with the stored order.
3. Webhooks: read the RAW body, `verifyRazorpayWebhook`, reject otherwise with 401; make handling idempotent (store the event id) and only move orders forward.
4. Shiprocket: authenticate its webhook with a shared token (`verifySharedToken`; confirm the exact header name in their docs); never let a webhook set payment status.
5. Decrement stock in the same transaction that marks the order paid.

## Firebase console actions (yours; not done)
- Authentication > Settings: enable **email enumeration protection** and a **password policy** (length, mixed case, number).
- Consider upgrading to Identity Platform for **multi-factor authentication** on the owner account.
- Enable **App Check** (reCAPTCHA Enterprise) and later enforce it.
- Restrict the web API key to your domains (Google Cloud Console).
- After editing the UID placeholder, deploy `firestore.rules`, `firestore.indexes.json`, `storage.rules` yourself.
- To rotate the owner's access: revoke refresh tokens and re-run provisioning; claim changes apply on the next sign-in.

## How to run the checks
`npm test` (unit), `npm run check:security` (static), `npm run check:boundaries`, `npm run test:rules` (emulator; needs Java; never run by the author), `npm install && npm audit`.
