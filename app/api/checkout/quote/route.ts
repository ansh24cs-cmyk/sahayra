import { withUser, readJson } from "@/lib/server/guard"; import { quoteCart } from "@/lib/server/checkout";
export const POST = (req: Request) => withUser(req, false, async (uid) => quoteCart(uid, await readJson(req)));
