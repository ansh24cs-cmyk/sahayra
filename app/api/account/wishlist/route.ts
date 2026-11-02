import { withUser, readJson, HttpError } from "@/lib/server/guard"; import { addToWishlist, listWishlist } from "@/lib/server/wishlist";
export const GET = (req: Request) => withUser(req, false, (uid) => listWishlist(uid));
export const POST = (req: Request) => withUser(req, true, async (uid) => { const b = await readJson(req); if (typeof b?.productId !== "string") throw new HttpError(400, "validation"); return addToWishlist(uid, b.productId); });
