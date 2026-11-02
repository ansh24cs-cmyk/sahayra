import "server-only";
import { FieldValue } from "firebase-admin/firestore"; import { adminAuth, adminDb } from "@/lib/firebase/admin"; import { HttpError, assertId } from "./guard"; import { toOrder } from "./orders"; import { validateStatusUpdate } from "@/lib/admin/validation"; import type { FulfilmentStatus } from "@/lib/types";
export async function listAllOrders() { return { items: (await adminDb().collection("orders").orderBy("createdAt", "desc").limit(100).get()).docs.map((d) => toOrder(d.id, d.data())) }; }
/** Forward-only transitions. Cancelling a paid order flags a refund; this system does not move money. */
export async function updateOrderStatus(adminUid: string, id: string, input: unknown) {
  await adminDb().runTransaction(async (tx) => { const ref = adminDb().collection("orders").doc(assertId(id)); const s = await tx.get(ref); if (!s.exists) throw new HttpError(404, "not_found");
    const d = s.data()!; const v = validateStatusUpdate(input, d.fulfilmentStatus as FulfilmentStatus); if (!v.ok) throw new HttpError(409, "validation", v.errors);
    const refund = v.value.status === "cancelled" && d.payment?.status === "paid" ? " Refund required: not processed by this system." : "";
    tx.update(ref, { fulfilmentStatus: v.value.status, ...(v.value.shipment ? { shipment: { ...v.value.shipment, events: d.shipment?.events ?? [] } } : {}),
      history: [...(d.history ?? []), { status: v.value.status, at: new Date().toISOString(), note: (v.value.note + refund).trim() || undefined, by: adminUid }].map((h) => JSON.parse(JSON.stringify(h))), updatedAt: FieldValue.serverTimestamp() }); });
}
export async function listCustomers(token?: string) {
  const r = await adminAuth().listUsers(100, token || undefined);
  return { items: r.users.map((u) => ({ uid: u.uid, email: u.email ?? null, displayName: u.displayName ?? null, emailVerified: u.emailVerified, disabled: u.disabled, createdAt: u.metadata.creationTime, lastSignIn: u.metadata.lastSignInTime || null, isOwner: u.customClaims?.admin === true })), nextToken: r.pageToken ?? null };
}
