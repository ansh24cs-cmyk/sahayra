"use client";
import { useState } from "react";
export default function Newsletter() {
  const [email, setEmail] = useState(""); const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const submit = (e: React.FormEvent) => { e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState("error");
    /* TODO(firebase): write to Firestore `subscribers` */ setState("done"); };
  return (<form onSubmit={submit} noValidate className="mx-auto max-w-lg text-center">
    <h2 className="font-serif text-3xl">Hear about new pieces first</h2><p className="mt-2 text-sm text-espresso/70">One email when something new arrives. Unsubscribe any time.</p>
    <div className="mt-6 flex border-b border-espresso"><label htmlFor="nl" className="sr-only">Email address</label>
      <input id="nl" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState("idle"); }} placeholder="Your email address" aria-invalid={state === "error"} className="flex-1 bg-transparent py-3 outline-none" />
      <button className="px-4 text-sm hover:text-gold">Subscribe</button></div>
    <p role="status" className="mt-2 min-h-5 text-xs">{state === "error" && "Enter a valid email address, for example name@example.com."}{state === "done" && "Thank you. You are on the list."}</p></form>);
}
