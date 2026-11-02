import { collectionHandlers } from "@/lib/server/admin";
import { validateBanner } from "@/lib/admin/validation";
const h = collectionHandlers({ name: "banners", validate: validateBanner, orderBy: ["order", "asc"] });
export const GET = h.list;
export const POST = h.create;
