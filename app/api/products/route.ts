import { queryProducts } from "@/lib/server/products";
import type { Category, ProductQuery } from "@/lib/types";
const CATS = ["earrings", "necklaces", "rings", "bracelets", "anklets"];
export async function GET(req: Request) {
  const s = new URL(req.url).searchParams; const sort = s.get("sort"); const cat = s.get("category"); const max = Number(s.get("max")); const page = Number(s.get("page"));
  const q: ProductQuery = { q: s.get("q")?.slice(0, 80) || undefined, category: cat && CATS.includes(cat) ? (cat as Category) : undefined,
    maxPrice: max > 0 ? max : undefined, inStock: s.get("stock") === "1", sort: sort === "low" || sort === "high" ? sort : "new", page: page > 0 ? Math.floor(page) : 1 };
  try { return Response.json(await queryProducts(q)); } catch (e) { console.error("[api/products]", e); return Response.json({ error: "products_unavailable" }, { status: 500 }); }
}
