import { withUser } from "@/lib/server/guard"; import { removeFromWishlist } from "@/lib/server/wishlist";
export const DELETE = (req: Request, { params }: { params: { productId: string } }) => withUser(req, true, (uid) => removeFromWishlist(uid, params.productId));
