// Fails on: server-only imports inside "use client" files, getProducts used outside client files, duplicate routes, import cycles.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"; import { join, dirname, relative } from "node:path";
const ROOT = process.cwd(), EXT = [".ts", ".tsx"], SKIP = new Set(["node_modules", ".next", "tests", "scripts"]);
const walk = (d) => readdirSync(d).flatMap((n) => SKIP.has(n) ? [] : statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : EXT.some((e) => n.endsWith(e)) ? [join(d, n)] : []);
const files = ["app", "components", "context", "lib"].filter((d) => existsSync(join(ROOT, d))).flatMap((d) => walk(join(ROOT, d)));
const src = Object.fromEntries(files.map((f) => [f, readFileSync(f, "utf8")]));
const rel = (f) => relative(ROOT, f).replaceAll("\\", "/"); const errs = [];
const isClient = (s) => /^\s*(\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(s);
const SERVER = /from\s+["'](@\/lib\/server\/|@\/lib\/firebase\/admin|@\/lib\/auth\/server|server-only)/;
const importsOf = (s) => [...s.matchAll(/(?:^|\n)\s*import[^"']*?from\s+["']([^"']+)["']/g)].map((m) => m[1]);
const resolve = (from, spec) => { const base = spec.startsWith("@/") ? join(ROOT, spec.slice(2)) : spec.startsWith(".") ? join(dirname(from), spec) : null; if (!base) return null;
  return [base, ...EXT.map((e) => base + e), ...EXT.map((e) => join(base, "index" + e))].find((p) => src[p] !== undefined) ?? null; };
const graph = {};
for (const f of files) { const s = src[f], client = isClient(s); graph[f] = importsOf(s).map((i) => resolve(f, i)).filter(Boolean);
  if (client && SERVER.test(s)) errs.push(`${rel(f)}: client file imports a server-only module`);
  if (!client && rel(f) !== "lib/api.ts" && /import[^;]*\bgetProducts\b[^;]*from\s+["']@\/lib\/api["']/.test(s) && /^app\/.*(page|layout)\.tsx$/.test(rel(f)))
    errs.push(`${rel(f)}: server page imports browser-only getProducts (use queryProducts from @/lib/server/products)`); }
const routes = {}; for (const f of files.filter((f) => /\/app\/.*\/?page\.tsx$/.test(f.replaceAll("\\", "/")))) {
  const r = rel(f).replace(/^app\//, "").replace(/\(.*?\)\//g, "").replace(/page\.tsx$/, ""); (routes[r] ??= []).push(rel(f)); }
for (const [r, fs] of Object.entries(routes)) if (fs.length > 1) errs.push(`duplicate route "/${r}": ${fs.join(" and ")}`);
const seen = new Set(), stack = [];
(function dfs(f) { if (stack.includes(f)) { errs.push("import cycle: " + [...stack.slice(stack.indexOf(f)), f].map(rel).join(" -> ")); return; } if (seen.has(f)) return; seen.add(f); stack.push(f); graph[f].forEach(dfs); stack.pop(); }, files.forEach((f) => { stack.length = 0; }));
for (const f of files) { stack.length = 0; (function d(x) { if (stack.includes(x)) { if (x === f) errs.push("import cycle through " + rel(f)); return; } stack.push(x); (graph[x] ?? []).forEach(d); stack.pop(); })(f); }
const uniq = [...new Set(errs)]; console.log(uniq.length ? uniq.map((e) => "FAIL " + e).join("\n") : `OK: ${files.length} files checked, no boundary problems, duplicate routes or import cycles.`); process.exit(uniq.length ? 1 : 0);
