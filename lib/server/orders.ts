import "server-only";
import { FieldValue } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin"; import { HttpError, assertId } from "./guard"; import type { OrderRecord } from "@/lib/types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iso = (t: any) => (typeof t?.toDate === "function" ? t.toDate().toISOString() : String(t ?? ""));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toOrder = (id: string, d: any): OrderRecord => ({ ...d, id, createdAt: iso(d.createdAt), updatedAt: iso(d.updatedAt) });
export async function listOrders(uid: string) { return { items: (await adminDb().collection("orders").where("userId", "==", uid).orderBy("createdAt", "desc").limit(50).get()).docs.map((d) => toOrder(d.id, d.data())) }; }
export async function getOrder(uid: string, id: string) {
  const s = await adminDb().collection("orders").doc(assertId(id)).get();
  if (!s.exists || s.data()?.userId !== uid) throw new HttpError(404, "not_found"); // 404 for both, so order ids can't be probed
  return toOrder(s.id, s.data());
}
/** For the future checkout phase (after server-side price verification). Not reachable from any route. */
export async function createOrderRecord(rec: OrderRecord) { const { id, ...rest } = rec; await adminDb().collection("orders").doc(id).create({ ...rest, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); }
