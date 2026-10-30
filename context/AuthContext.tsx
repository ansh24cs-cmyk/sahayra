"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import type { AuthStatus, AuthUser } from "@/lib/auth/types";
const Ctx = createContext<{ status: AuthStatus; user: AuthUser | null }>({ status: "initialising", user: null });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthStatus; user: AuthUser | null }>({ status: "initialising", user: null });
  useEffect(() => {
    const a = getClientAuth(); if (!a) return setState({ status: "unconfigured", user: null });
    return onAuthStateChanged(a, (u) => setState(!u ? { status: "signed-out", user: null } : {
      status: u.emailVerified ? "signed-in" : "verification-required", user: { uid: u.uid, email: u.email, displayName: u.displayName, emailVerified: u.emailVerified } }),
      () => setState({ status: "error", user: null }));
  }, []);
  const v = useMemo(() => state, [state]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
