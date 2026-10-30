import type { Paged, Product, ProductQuery } from "../types";
export const PAGE_SIZE = 12;
const low = (p: Product) => Math.min(...p.variants.map((v) => v.priceInr));
const avail = (p: Product) => p.variants.some((v) => v.stock > 0);
/** Pure filter/sort/paginate. Used by the server data layer; fine for a small catalogue. */
export function applyQuery(all: Product[], q: ProductQuery): Paged<Product> {
  let items = all.filter((p) => !p.archived && p.variants.length > 0);
  if (q.category) items = items.filter((p) => p.category === q.category);
  if (q.q) { const n = q.q.toLowerCase(); items = items.filter((p) => `${p.name} ${p.material}`.toLowerCase().includes(n)); }
  if (q.maxPrice) items = items.filter((p) => low(p) <= q.maxPrice!);
  if (q.inStock) items = items.filter(avail);
  const sorts = { low: (a: Product, b: Product) => low(a) - low(b), high: (a: Product, b: Product) => low(b) - low(a), new: (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt) };
  items = [...items].sort(sorts[q.sort ?? "new"]);
  const page = Math.max(1, q.page ?? 1);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: items.length };
}
