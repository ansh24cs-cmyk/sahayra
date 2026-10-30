import Link from "next/link"; import { Suspense } from "react";
import { AuthShell } from "@/components/auth/ui"; import { LoginForm } from "@/components/auth/forms";
export const metadata = { title: "Sign in" };
export default function Page() { return <AuthShell title="Welcome back" sub="Sign in to your Sahayra account." foot={<>New here? <Link href="/signup" className="underline">Create an account</Link></>}><Suspense><LoginForm /></Suspense></AuthShell>; }
