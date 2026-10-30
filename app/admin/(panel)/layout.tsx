import { redirect } from "next/navigation"; import Link from "next/link";
import { getAdminDecision } from "@/lib/auth/server"; import AdminNav from "@/components/admin/AdminNav";
export const dynamic = "force-dynamic";
/** The real security boundary: verified on the server for every request, deny by default. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { decision } = await getAdminDecision();
  if (decision === "unauthenticated") redirect("/admin/login");
  if (decision !== "ok") return (<div className="mx-auto max-w-md px-5 py-24"><h1 className="font-serif text-3xl">{decision === "forbidden" ? "Access denied" : "Admin isn't configured"}</h1>
    <p className="mt-3 text-sm text-espresso/70">{decision === "forbidden" ? "This account isn't authorised for the admin area." : "Server-side admin configuration is missing, so access is blocked. See docs/AUTH_SETUP.md."}</p>
    <Link href="/" className="mt-6 inline-block text-sm underline">Back to the store</Link></div>);
  return <div className="md:flex"><AdminNav /><div className="flex-1 p-6 md:p-10">{children}</div></div>;
}
