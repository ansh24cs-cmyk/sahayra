const dev = process.env.NODE_ENV !== "production";
// CSP is REPORT-ONLY on purpose: check the browser console on every page, then rename the header to Content-Security-Policy to enforce.
// 'unsafe-inline' scripts are needed by Next.js without a nonce setup; it weakens, but does not remove, the policy.
const csp = ["default-src 'self'", `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:", "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'"].join("; ");
module.exports = { poweredByHeader: false, async headers() { return [{ source: "/:path*", headers: [
  { key: "Content-Security-Policy-Report-Only", value: csp }, { key: "X-Frame-Options", value: "DENY" }, { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] }]; } };
