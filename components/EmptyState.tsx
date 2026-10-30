import Link from "next/link";
export default function EmptyState({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
  return (<div className="border border-champagne/60 px-6 py-14 text-center">
    <h3 className="font-serif text-2xl text-espresso">{title}</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm text-espresso/70">{body}</p>
    {href && cta && <Link href={href} className="mt-6 inline-block border border-espresso px-6 py-2.5 text-sm hover:bg-espresso hover:text-ivory transition-colors">{cta}</Link>}
  </div>);
}
