import { AuthShell } from "@/components/auth/ui"; import { ForgotForm } from "@/components/auth/forms";
export const metadata = { title: "Reset password" };
export default function Page() { return <AuthShell title="Reset your password" sub="Enter your email and we'll send a reset link."><ForgotForm /></AuthShell>; }
