"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { refreshUser, resendVerificationEmail, signOutUser } from "@/lib/auth/service";
import { Notice, SetupNotice } from "./ui";
/** UX guard only. Real enforcement happens in server routes (lib/auth/server.ts) and Firestore rules. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth(); const router = useRouter(); const path = usePathname(); const [m, setM] = useState("");
  useEffect(() => { if (status === "signed-out") router.replace(`/login?next=${encodeURIComponent(path)}`); }, [status, path, router]);
  if (status === "initialising" || status === "signed-out") return <div className="mx-auto h-64 max-w-3xl animate-pulse px-5 py-16" aria-busy="true" aria-label="Loading your account" />;
  if (status === "unconfigured") return <div className="mx-auto max-w-md px-5 py-16"><SetupNotice /></div>;
  if (status === "error") return <div className="mx-auto max-w-md px-5 py-16"><Notice tone="error">We couldn't check your session. Refresh the page or sign in again.</Notice></div>;
  if (status === "verification-required") return (<div className="mx-auto max-w-md px-5 py-16"><h1 className="font-serif text-3xl">Verify your email</h1>
    <p className="mt-3 text-sm text-espresso/75">Open the link we emailed you to unlock your account. After verifying, reload this page.</p>{m && <p role="status" className="mt-3 text-sm">{m}</p>}
    <div className="mt-6 flex gap-4 text-sm"><button className="underline" onClick={async () => { try { setM((await resendVerificationEmail()) === "sent" ? "Verification email sent." : "Please wait a minute before requesting another."); } catch { setM("Couldn't send. Try again shortly."); } }}>Resend email</button>
      <button className="underline" onClick={async () => { await refreshUser().catch(() => {}); location.reload(); }}>I've verified</button><button className="underline" onClick={() => signOutUser().then(() => router.replace("/"))}>Sign out</button></div></div>);
  return <>{children}</>;
}
