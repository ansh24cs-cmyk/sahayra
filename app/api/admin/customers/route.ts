import { withAdmin } from "@/lib/server/admin"; import { listCustomers } from "@/lib/server/adminOrders";
export const GET = (req: Request) => withAdmin(req, false, () => listCustomers(new URL(req.url).searchParams.get("token") ?? undefined));
