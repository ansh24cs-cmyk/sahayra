import Link from "next/link";
export const metadata = { title: "Track an order" };
export default function Page() { return (<div className="mx-auto max-w-xl px-5 py-16 md:py-24"><h1 className="font-serif text-5xl">Track an order</h1>
  <p className="mt-4 text-espresso/80">Your orders, their status and shipment details are in your account. Courier and tracking numbers appear there once an order ships.</p>
  <Link href="/account/orders" className="mt-8 inline-block bg-espresso px-7 py-3 text-sm text-ivory hover:bg-ink">View my orders</Link><p className="mt-6 text-sm text-espresso/70">Need help? <Link href="/contact" className="underline">Contact us</Link>.</p></div>); }
