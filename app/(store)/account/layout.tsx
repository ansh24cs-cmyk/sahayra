import RequireAuth from "@/components/auth/RequireAuth"; import { AccountNav } from "@/components/auth/Account";
export const metadata = { title: "Account", robots: { index: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return <RequireAuth><div className="mx-auto max-w-4xl px-5 py-12"><AccountNav />{children}</div></RequireAuth>; }
