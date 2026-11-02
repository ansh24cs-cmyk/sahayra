"use client";
import { useEffect, useState } from "react";
import { apiMessage, authedFetch } from "@/lib/auth/clientFetch"; import { formatInr } from "@/lib/format"; import type { OrderRecord } from "@/lib/types"; import EmptyState from "@/components/EmptyState"; import { Notice } from "@/components/auth/ui";
export default function Orders() {
  const [items, setItems] = useState<OrderRecord[] | null>(null); const [msg, setMsg] = useState("");
  useEffect(() => { authedFetch<{ items: OrderRecord[] }>("/api/account/orders").then((r) => setItems(r.items)).catch((e) => { setMsg(apiMessage(e)); setItems([]); }); }, []);
  return (<div><h1 className="mb-6 font-serif text-4xl">Orders</h1>{msg && <Notice tone="error">{msg}</Notice>}
    {items === null ? <div className="h-40 animate-pulse bg-champagne/25" aria-busy="true" />
    : items.length === 0 ? <EmptyState title="No orders yet" body="Your orders will appear here after your first purchase." href="/shop" cta="Browse jewellery" />
    : <ul className="space-y-4">{items.map((o) => (<li key={o.id} className="border border-champagne/60 p-5 text-sm"><div className="flex flex-wrap justify-between gap-2"><p className="font-serif text-lg">{o.orderNumber}</p><p>{formatInr(o.totalInr)}</p></div>
      <p className="text-espresso/70">{new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} · Payment: {o.payment.status} · {o.fulfilmentStatus}</p>
      <p className="mt-2 text-espresso/70">{o.lines.map((l) => `${l.name} × ${l.qty}`).join(", ")}</p></li>))}</ul>}
  </div>);
}
