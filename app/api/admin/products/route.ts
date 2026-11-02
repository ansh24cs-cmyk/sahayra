import { withAdmin } from "@/lib/server/admin"; import { readJson } from "@/lib/server/guard"; import { createProduct, listAllProducts } from "@/lib/server/adminProducts";
export const GET = (req: Request) => withAdmin(req, false, () => listAllProducts());
export const POST = (req: Request) => withAdmin(req, true, async () => createProduct(await readJson(req)));
