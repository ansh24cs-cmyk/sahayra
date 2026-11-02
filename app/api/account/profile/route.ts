import { FieldValue } from "firebase-admin/firestore"; import { adminDb } from "@/lib/firebase/admin"; import { HttpError, readJson, withUser } from "@/lib/server/guard"; import { validateProfile } from "@/lib/account/validation";
const ref = (uid: string) => adminDb().collection("users").doc(uid);
export const GET = (req: Request) => withUser(req, false, async (uid) => { const d = (await ref(uid).get()).data() ?? {}; return { displayName: d.displayName ?? "", phone: d.phone ?? "" }; });
export const PATCH = (req: Request) => withUser(req, true, async (uid) => { const v = validateProfile(await readJson(req)); if (!v.ok) throw new HttpError(400, "validation", v.errors); await ref(uid).set({ ...v.value, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); });
