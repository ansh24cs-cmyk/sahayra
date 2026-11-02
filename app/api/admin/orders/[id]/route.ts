import { withAdmin } from "@/lib/server/admin"; import { readJson } from "@/lib/server/guard"; import { updateOrderStatus } from "@/lib/server/adminOrders";
export const PATCH = (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, async (uid) => updateOrderStatus(uid, params.id, await readJson(req)));
