import { listCategories } from "@/lib/server/categories"; import { RULES, clientKey, tooMany } from "@/lib/server/limits";
export async function GET(req: Request) {
  const lim = tooMany(req, "pub", RULES.publicRead, clientKey(req)); if (lim) return lim;
  return Response.json({ items: await listCategories() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
