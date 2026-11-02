import RequireAuth from "@/components/auth/RequireAuth"; import Checkout from "@/components/Checkout";
export const metadata = { title: "Checkout", robots: { index: false } };
export default function Page() { return <RequireAuth><Checkout /></RequireAuth>; }
