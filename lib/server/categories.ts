import "server-only";
import { adminDb } from "@/lib/firebase/admin"; import { missingServerConfig } from "@/lib/config"; import { CATEGORIES } from "@/lib/categories";
/** Admin-created categories if any exist, otherwise the built-in defaults. */
export async function listCategories(): Promise<readonly (readonly [string, string])[]> {
  if (missingServerConfig().length) return CATEGORIES;
  try { const s = await adminDb().collection("categories").orderBy("order", "asc").get(); return s.empty ? CATEGORIES : s.docs.map((d) => [d.id, String(d.data().name)] as const); } catch { return CATEGORIES; }
}
export async function categoryExists(slug: string) { if (CATEGORIES.some((c) => c[0] === slug)) return true; return (await adminDb().collection("categories").doc(slug).get()).exists; }
