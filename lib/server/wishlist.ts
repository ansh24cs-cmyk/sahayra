import "server-only";
import { adminDb } from "@/lib/firebase/admin"; import { HttpError, assertId } from "./guard"; import { toProduct } from "./products"; import type { Product } from "@/lib/types";
const col = (uid: string) => adminDb().collection("users").doc(uid).collection("wishlist");
/** The product id IS the document id, so duplicates are impossible; repeat adds are idempotent. */
export async function addToWishlist(uid: string, productId: string) {
  assertId(productId); const p = await adminDb().collection("products").doc(productId).get();
  if (!p.exists || p.data()?.archived !== false) throw new HttpError(404, "product_not_found");
  try { await col(uid).doc(productId).create({ productId, addedAt: new Date().toISOString() }); } catch (e) { if ((e as { code?: number }).code !== 6) throw e; }
  return { ok: true };
}
export async function removeFromWishlist(uid: string, productId: string) { await col(uid).doc(assertId(productId)).delete(); return { ok: true }; }
export async function listWishlist(uid: string): Promise<{ items: Product[] }> {
  const entries = (await col(uid).get()).docs.map((d) => d.data() as { productId: string; addedAt: string }).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  if (!entries.length) return { items: [] };
  const snaps = await adminDb().getAll(...entries.map((e) => adminDb().collection("products").doc(e.productId)));
  return { items: snaps.filter((s) => s.exists && s.data()?.archived === false).map((s) => toProduct(s.id, s.data())) };
}
