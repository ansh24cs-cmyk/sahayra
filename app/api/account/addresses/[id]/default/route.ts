import { withUser, assertId } from "@/lib/server/guard"; import { setDefaultAddress } from "@/lib/server/addresses";
export const POST = (req: Request, { params }: { params: { id: string } }) => withUser(req, true, async (uid) => { await setDefaultAddress(uid, assertId(params.id)); });
