import "server-only";
import { FieldValue } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin"; import { HttpError } from "./guard"; import type { Address, AddressInput } from "@/lib/types";
const MAX = 10;
const col = (uid: string) => adminDb().collection("users").doc(uid).collection("addresses"); // path is scoped by the verified uid
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iso = (t: any) => (typeof t?.toDate === "function" ? t.toDate().toISOString() : "");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAddr = (id: string, d: any): Address => ({ id, fullName: d.fullName, phone: d.phone, line1: d.line1, line2: d.line2 || undefined, landmark: d.landmark || undefined, city: d.city, state: d.state, pincode: d.pincode, country: "India", label: d.label, isDefault: !!d.isDefault, createdAt: iso(d.createdAt), updatedAt: iso(d.updatedAt) });
const clean = (a: AddressInput) => ({ ...a, line2: a.line2 ?? "", landmark: a.landmark ?? "" });
export async function listAddresses(uid: string) { return (await col(uid).orderBy("createdAt", "desc").get()).docs.map((d) => toAddr(d.id, d.data())); }
export async function createAddress(uid: string, input: AddressInput) {
  const ref = col(uid).doc();
  await adminDb().runTransaction(async (tx) => { const all = await tx.get(col(uid)); if (all.size >= MAX) throw new HttpError(409, "address_limit");
    tx.set(ref, { ...clean(input), isDefault: all.empty, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); });
  return { id: ref.id };
}
export async function updateAddress(uid: string, id: string, input: AddressInput) {
  const ref = col(uid).doc(id); if (!(await ref.get()).exists) throw new HttpError(404, "not_found"); await ref.update({ ...clean(input), updatedAt: FieldValue.serverTimestamp() });
}
export async function deleteAddress(uid: string, id: string) {
  await adminDb().runTransaction(async (tx) => { const ref = col(uid).doc(id); const s = await tx.get(ref); const all = await tx.get(col(uid).orderBy("createdAt", "desc"));
    if (!s.exists) throw new HttpError(404, "not_found"); tx.delete(ref);
    if (s.data()?.isDefault) { const next = all.docs.find((d) => d.id !== id); if (next) tx.update(next.ref, { isDefault: true }); } });
}
export async function setDefaultAddress(uid: string, id: string) {
  await adminDb().runTransaction(async (tx) => { const all = await tx.get(col(uid)); if (!all.docs.some((d) => d.id === id)) throw new HttpError(404, "not_found"); all.docs.forEach((d) => tx.update(d.ref, { isDefault: d.id === id })); });
}
