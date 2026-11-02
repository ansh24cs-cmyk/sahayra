// Static security checks. These are NOT penetration tests: they catch regressions in properties that can be verified by reading source.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"; import { join, relative } from "node:path";
const SKIP = new Set(["node_modules", ".next", "tests"]); const walk = (d) => readdirSync(d).flatMap((n) => SKIP.has(n) ? [] : statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]);
const rel = (f) => relative(process.cwd(), f).replaceAll("\\", "/"); const src = ["app", "components", "context", "lib"].filter(existsSync).flatMap(walk).filter((f) => /\.(ts|tsx)$/.test(f)); const text = (f) => readFileSync(f, "utf8"); const fails = [];
const PUBLIC = ["app/api/auth/session/route.ts", "app/api/categories/route.ts", "app/api/contact/route.ts", "app/api/products/route.ts"];
for (const f of src.filter((f) => /^app\/api\/.*route\.ts$/.test(rel(f)))) { const s = text(f), r = rel(f);
  if (PUBLIC.includes(r)) { if (!s.includes("tooMany(")) fails.push(`${r}: public route without rate limiting`); }
  else if (!/withUser\(|withAdmin\(|collectionHandlers\(/.test(s)) fails.push(`${r}: API route has no authentication/authorisation guard and is not on the reviewed public list`); }
for (const f of src) { const s = text(f), r = rel(f);
  if (/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function\(|document\.write\(/.test(s)) fails.push(`${r}: dangerous sink (XSS / code execution)`);
  if (/^\s*["']use client["']/.test(s) && /process\.env\.(?!NEXT_PUBLIC_|NODE_ENV)/.test(s)) fails.push(`${r}: client file reads a non-public environment variable`);
  if (/^(lib\/server\/|lib\/firebase\/admin\.ts)/.test(r) && !s.includes('import "server-only"')) fails.push(`${r}: server module is missing the server-only guard`);
  for (const m of s.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) if (/SECRET|PRIVATE|PASSWORD|SERVICE|ADMIN|TOKEN/.test(m[0])) fails.push(`${r}: secret-looking public variable ${m[0]}`);
  if (/Access-Control-Allow-Origin/i.test(s)) fails.push(`${r}: sets CORS headers (review)`); }
if (!/\.env\*\.local|\.env\.local/.test(text(".gitignore"))) fails.push(".gitignore does not exclude .env.local");
for (const f of ["firestore.rules", "storage.rules"]) { const s = text(f); if (/allow\s+[a-z, ]*(write|read)[a-z, ]*:\s*if\s+true/.test(s.replace(/allow read: if true;/g, ""))) fails.push(`${f}: unconditional allow`); if (!/match \/\{(doc|allPaths)=\*\*\}[^}]*if false/.test(s)) fails.push(`${f}: missing default-deny catch-all`); }
if (/allow (read, )?write: if isAdmin\(\)/.test(text("firestore.rules"))) fails.push("firestore.rules: client writes are allowed for the owner (writes should be server-only)");
if (!text("firestore.rules").includes("request.auth.token.admin == true")) fails.push("firestore.rules: admin check does not require the custom claim");
const nc = existsSync("next.config.js") ? text("next.config.js") : ""; for (const h of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Content-Security-Policy"]) if (!nc.includes(h)) fails.push(`next.config.js: missing ${h}`);
console.log(fails.length ? fails.map((x) => "FAIL " + x).join("\n") : `OK: ${src.length} source files and both rules files passed all static security checks.`); process.exit(fails.length ? 1 : 0);
