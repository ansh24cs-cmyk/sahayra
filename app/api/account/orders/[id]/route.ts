import { withUser } from "@/lib/server/guard"; import { getOrder } from "@/lib/server/orders";
export const GET = (req: Request, { params }: { params: { id: string } }) => withUser(req, false, (uid) => getOrder(uid, params.id));
