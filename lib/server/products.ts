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
  const items = snap.docs.map((d) => { const x = d.data();
    return { ...x, id: d.id, createdAt: typeof x.createdAt?.toDate === "function" ? x.createdAt.toDate().toISOString() : String(x.createdAt ?? "") } as Product; });
  return applyQuery(items, q);
}
