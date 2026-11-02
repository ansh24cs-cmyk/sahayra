import { withUser, readJson, HttpError } from "@/lib/server/guard"; import { createAddress, listAddresses } from "@/lib/server/addresses"; import { validateAddress } from "@/lib/account/validation";
export const GET = (req: Request) => withUser(req, false, async (uid) => ({ items: await listAddresses(uid) }));
export const POST = (req: Request) => withUser(req, true, async (uid) => { const v = validateAddress(await readJson(req)); if (!v.ok) throw new HttpError(400, "validation", v.errors); return createAddress(uid, v.value); });
