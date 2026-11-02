import "server-only";
import { AggregateField } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin";
export const LOW_STOCK_AT = 3;
/** Real numbers straight from Firestore. Zero when there is no data. */
export async function getDashboardStats() {
  const db = adminDb();
  const [prod, ord, paid, open, live] = await Promise.all([db.collection("products").count().get(), db.collection("orders").count().get(),
    db.collection("orders").where("payment.status", "==", "paid").aggregate({ revenue: AggregateField.sum("totalInr"), n: AggregateField.count() }).get(),
    db.collection("orders").where("fulfilmentStatus", "in", ["pending", "processing", "packed"]).count().get(), db.collection("products").where("archived", "==", false).get()]);
  const vs = live.docs.flatMap((d) => (d.data().variants ?? []) as { stock: number }[]);
  return { products: prod.data().count, orders: ord.data().count, paidOrders: paid.data().n, revenueInr: paid.data().revenue ?? 0, openOrders: open.data().count, lowStock: vs.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_AT).length, outOfStock: vs.filter((v) => v.stock === 0).length };
}
