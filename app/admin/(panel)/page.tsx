import { missingServerConfig } from "@/lib/config"; import { getDashboardStats, LOW_STOCK_AT } from "@/lib/server/stats"; import { formatInr } from "@/lib/format";
export const metadata = { title: "Dashboard" };
export default async function Page() {
  let s: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  try { if (!missingServerConfig().length) s = await getDashboardStats(); } catch (e) { console.error("[dashboard]", e); }
  const cards: [string, string | number][] = s ? [["Products", s.products], ["Orders", s.orders], ["Paid revenue", formatInr(s.revenueInr)], ["Open orders", s.openOrders], [`Low stock (${LOW_STOCK_AT} or fewer)`, s.lowStock], ["Out of stock", s.outOfStock]] : [];
  return (<div><h1 className="font-serif text-4xl">Dashboard</h1>
    {!s ? <p className="mt-6 max-w-md border border-champagne px-4 py-3 text-sm" role="status">Figures couldn't be loaded. Check the server logs and the Firebase configuration.</p>
    : <><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{cards.map(([l, v]) => <div key={l} className="border border-champagne/60 p-5"><p className="text-sm text-espresso/60">{l}</p><p className="mt-2 font-serif text-3xl">{v}</p></div>)}</div>
      <p className="mt-6 text-xs text-espresso/60">Figures come directly from your database. Nothing is estimated or sample data.</p></>}</div>);
}
