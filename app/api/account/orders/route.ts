import { withUser } from "@/lib/server/guard"; import { listOrders } from "@/lib/server/orders";
export const GET = (req: Request) => withUser(req, false, (uid) => listOrders(uid));
