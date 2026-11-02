import { withAdmin } from "@/lib/server/admin"; import { listAllOrders } from "@/lib/server/adminOrders";
export const GET = (req: Request) => withAdmin(req, false, () => listAllOrders());
