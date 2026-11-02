import "server-only";
import { adminDb } from "@/lib/firebase/admin"; import { missingServerConfig } from "@/lib/config";
export async function listPublishedBanners() {
  if (missingServerConfig().length) return [];
  try { return (await adminDb().collection("banners").where("published", "==", true).get()).docs.map((d) => ({ id: d.id, title: String(d.data().title), subtitle: String(d.data().subtitle ?? ""), imageUrl: String(d.data().imageUrl ?? ""), href: String(d.data().href ?? ""), order: Number(d.data().order ?? 0) })).sort((a, b) => a.order - b.order).slice(0, 4); } catch { return []; }
}
