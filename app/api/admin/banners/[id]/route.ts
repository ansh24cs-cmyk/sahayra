import { collectionHandlers } from "@/lib/server/admin";
import { validateBanner } from "@/lib/admin/validation";
const h = collectionHandlers({ name: "banners", validate: validateBanner, orderBy: ["order", "asc"] });
export const PATCH = h.update;
export const DELETE = h.remove;
