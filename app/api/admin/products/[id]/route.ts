import { withAdmin } from "@/lib/server/admin"; import { readJson } from "@/lib/server/guard"; import { deleteProduct, updateProduct } from "@/lib/server/adminProducts";
export const PATCH = (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, async () => updateProduct(params.id, await readJson(req)));
export const DELETE = (req: Request, { params }: { params: { id: string } }) => withAdmin(req, true, () => deleteProduct(params.id));
