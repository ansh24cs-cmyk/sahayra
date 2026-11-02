import { collectionHandlers } from "@/lib/server/admin";
import { validateCoupon } from "@/lib/admin/validation";
const h = collectionHandlers({ name: "coupons", validate: validateCoupon, idField: "code" });
export const PATCH = h.update;
export const DELETE = h.remove;
