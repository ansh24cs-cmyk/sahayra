"use client";
import { useState } from "react"; import { validateContact } from "@/lib/content/contact"; import { Field, Notice, Submit, TextInput } from "@/components/auth/ui";
export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" }); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setMsg(""); const v = validateContact(f); if (!v.ok) return setErr(v.errors); setErr({}); setBusy(true);
    try { const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); if (r.ok) setDone(true); else { const d = await r.json().catch(() => ({})); if (d.fields) setErr(d.fields); else setMsg(r.status === 503 ? "Messages aren't connected yet. Please try again later." : "We couldn't send your message. Please try again."); } }
    catch { setMsg("Network problem. Check your connection and try again."); } finally { setBusy(false); } }
  if (done) return <Notice tone="ok">Thank you. Your message has been received.</Notice>;
  return (<form onSubmit={submit} noValidate>{msg && <Notice tone="error">{msg}</Notice>}
    <Field id="name" label="Your name" error={err.name}><TextInput id="name" autoComplete="name" value={f.name} error={err.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
    <Field id="email" label="Email address" error={err.email}><TextInput id="email" type="email" autoComplete="email" value={f.email} error={err.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
    <Field id="message" label="Message" error={err.message}><textarea id="message" rows={5} value={f.message} aria-invalid={!!err.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="w-full border border-espresso/30 bg-transparent px-3 py-2.5 outline-none focus:border-gold" /></Field>
    <div aria-hidden className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label></div>
    <Submit busy={busy}>Send message</Submit></form>);
}
