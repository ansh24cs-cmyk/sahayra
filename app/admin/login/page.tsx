import { Suspense } from "react"; import { Star } from "@/components/Logo";
import { LoginForm } from "@/components/auth/forms"; import { AuthShell } from "@/components/auth/ui";
export const metadata = { title: "Sign in" };
export default function Page() {
  return <AuthShell title="Administrator sign-in" sub="Restricted area. Access is limited to the authorised store administrator."><div className="mb-6 text-gold"><Star className="h-4 w-4" /></div>
    <Suspense><LoginForm admin /></Suspense><p className="mt-6 text-xs text-espresso/60">Activity on this page may be logged. Customer accounts can't sign in here.</p></AuthShell>;
}
