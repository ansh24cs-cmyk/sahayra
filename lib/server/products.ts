import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { missingServerConfig } from "@/lib/config";
import { applyQuery } from "@/lib/products/filter";
import type { Paged, Product, ProductQuery } from "@/lib/types";
/** Trusted server read. Admin SDK ignores Firestore rules, so archived items are excluded here. */
export async function queryProducts(q: ProductQuery = {}): Promise<Paged<Product>> {
  const missing = missingServerConfig();
  if (missing.length) { console.warn(`[products] server Firebase not configured (missing ${missing.join(", ")}); returning an empty catalogue.`); return { items: [], total: 0 }; }
  const snap = await adminDb().collection("products").where("archived", "==", false).get();
  const items = snap.docs.map((d) => toProduct(d.id, d.data()));
  return applyQuery(items, q);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProduct(id: string, x: any): Product {
  return { ...x, id, createdAt: typeof x.createdAt?.toDate === "function" ? x.createdAt.toDate().toISOString() : String(x.createdAt ?? "") } as Product;
}
export async function queryProductBySlug(slug: string): Promise<Product | null> {
  if (missingServerConfig().length || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const snap = await adminDb().collection("products").where("slug", "==", slug).where("archived", "==", false).limit(1).get();
  return snap.empty ? null : toProduct(snap.docs[0].id, snap.docs[0].data());
}
