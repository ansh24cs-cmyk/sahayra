import { collectionHandlers } from "@/lib/server/admin";
import { validateCategory } from "@/lib/admin/validation"; import { adminDb } from "@/lib/firebase/admin"; import { HttpError } from "@/lib/server/guard";
const h = collectionHandlers({ name: "categories", validate: validateCategory, idField: "slug", orderBy: ["order", "asc"], beforeDelete: async (id) => { if (!(await adminDb().collection("products").where("category", "==", id).limit(1).get()).empty) throw new HttpError(409, "category_in_use"); } });
export const PATCH = h.update;
export const DELETE = h.remove;
