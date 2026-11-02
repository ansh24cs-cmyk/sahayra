import { withAdmin } from "@/lib/server/admin"; import { readJson } from "@/lib/server/guard"; import { setStock } from "@/lib/server/adminProducts";
export const PATCH = (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, async () => setStock(params.id, await readJson(req)));
