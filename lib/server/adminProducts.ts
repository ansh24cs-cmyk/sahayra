import "server-only";
import { FieldValue } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin"; import { HttpError, assertId } from "./guard"; import { toProduct } from "./products"; import { categoryExists } from "./categories"; import { validateProduct } from "@/lib/admin/validation";
const col = () => adminDb().collection("products");
export async function listAllProducts() { return { items: (await col().orderBy("createdAt", "desc").limit(500).get()).docs.map((d) => toProduct(d.id, d.data())) }; }
async function checked(input: unknown, selfId?: string) {
  const v = validateProduct(input); if (!v.ok) throw new HttpError(400, "validation", v.errors);
  if (!(await categoryExists(v.value.category))) throw new HttpError(400, "validation", { category: "That category doesn't exist." });
  const dup = await col().where("slug", "==", v.value.slug).limit(2).get(); if (dup.docs.some((d) => d.id !== selfId)) throw new HttpError(409, "validation", { slug: "This URL slug is already used." });
  return v.value;
}
export async function createProduct(input: unknown) { const v = await checked(input); const ref = col().doc(); await ref.create({ ...v, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return { id: ref.id }; }
export async function updateProduct(id: string, input: unknown) {
  assertId(id); const ref = col().doc(id); if (!(await ref.get()).exists) throw new HttpError(404, "not_found");
  const b = (input ?? {}) as Record<string, unknown>;
  if (Object.keys(b).length === 1 && typeof b.archived === "boolean") { await ref.update({ archived: b.archived, updatedAt: FieldValue.serverTimestamp() }); return; } // publish / archive toggle
  await ref.update({ ...(await checked(input, id)), updatedAt: FieldValue.serverTimestamp() });
}
export async function deleteProduct(id: string) { await col().doc(assertId(id)).delete(); }
export async function setStock(id: string, input: unknown) {
  const b = (input ?? {}) as { sku?: unknown; stock?: unknown }; const stock = Number(b.stock);
  if (typeof b.sku !== "string" || !Number.isInteger(stock) || stock < 0 || stock > 100000) throw new HttpError(400, "validation", { stock: "Whole number, 0 or more." });
  await adminDb().runTransaction(async (tx) => { const ref = col().doc(assertId(id)); const s = await tx.get(ref); if (!s.exists) throw new HttpError(404, "not_found");
    const variants = (s.data()!.variants as { sku: string; stock: number }[]).map((v) => (v.sku === b.sku ? { ...v, stock } : v));
    if (!variants.some((v) => v.sku === b.sku)) throw new HttpError(404, "sku_not_found"); tx.update(ref, { variants, updatedAt: FieldValue.serverTimestamp() }); });
}
