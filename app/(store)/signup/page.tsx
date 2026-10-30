import Link from "next/link";
import { AuthShell } from "@/components/auth/ui"; import { SignupForm } from "@/components/auth/forms";
export const metadata = { title: "Create account" };
export default function Page() { return <AuthShell title="Create your account" foot={<>Already registered? <Link href="/login" className="underline">Sign in</Link></>}><SignupForm /></AuthShell>; }
