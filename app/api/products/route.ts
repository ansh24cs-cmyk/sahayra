import { RULES, clientKey, tooMany } from "@/lib/server/limits"; import { queryProducts } from "@/lib/server/products";
import type { ProductQuery } from "@/lib/types";
export async function GET(req: Request) {
  const lim = tooMany(req, "pub", RULES.publicRead, clientKey(req)); if (lim) return lim;
  const s = new URL(req.url).searchParams; const sort = s.get("sort"); const cat = s.get("category"); const max = Number(s.get("max")); const page = Number(s.get("page"));
  const q: ProductQuery = { q: s.get("q")?.slice(0, 80) || undefined, category: cat && /^[a-z0-9-]{1,40}$/.test(cat) ? cat : undefined,
    maxPrice: max > 0 ? max : undefined, inStock: s.get("stock") === "1", sort: sort === "low" || sort === "high" ? sort : "new", page: page > 0 ? Math.floor(page) : 1 };
  try { return Response.json(await queryProducts(q), { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }); } catch (e) { console.error("[api/products]", e); return Response.json({ error: "products_unavailable" }, { status: 500 }); }
}
