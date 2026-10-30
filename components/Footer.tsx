import Link from "next/link";
import Logo from "@/components/Logo";
const cols: [string, [string, string][]][] = [
  ["Help", [["Contact","/contact"],["FAQs","/faqs"],["Track an order","/track"],["Jewellery care","/care"]]],
  ["Policies", [["Shipping","/shipping-policy"],["Returns & refunds","/returns"],["Privacy","/privacy"],["Terms","/terms"]]],
  ["Sahayra", [["Our story","/about"],["Shop all","/shop"],["Account","/account"]]]];
export default function Footer() {
  return (<footer className="mt-24 bg-espresso text-ivory"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
    <div><Logo tagline tone="light" /><p className="mt-3 max-w-xs text-sm text-ivory/70">Fine and demi-fine jewellery, made to be worn every day.</p></div>
    {cols.map(([t, ls]) => <nav key={t} aria-label={t}><h2 className="font-serif text-lg text-champagne">{t}</h2><ul className="mt-3 space-y-2 text-sm">{ls.map(([n, h]) => <li key={h}><Link className="text-ivory/80 hover:text-champagne" href={h}>{n}</Link></li>)}</ul></nav>)}
  </div><p className="border-t border-ivory/15 py-5 text-center text-xs text-ivory/60">© {new Date().getFullYear()} Sahayra. All rights reserved.</p></footer>);
}
