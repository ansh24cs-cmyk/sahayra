import { notFound } from "next/navigation"; import { PAGES } from "@/lib/content/pages";
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PAGES).map((page) => ({ page }));
export function generateMetadata({ params }: { params: { page: string } }) { const d = PAGES[params.page]; return d ? { title: d.title, description: d.intro } : {}; }
export default function Page({ params }: { params: { page: string } }) {
  const d = PAGES[params.page]; if (!d) notFound();
  return (<article className="mx-auto max-w-2xl px-5 py-16 md:py-24"><h1 className="font-serif text-5xl">{d.title}</h1><p className="mt-3 text-espresso/70">{d.intro}</p>
    <div className="mt-10 space-y-8">{d.sections.map((s, i) => (<section key={i}>{s.h && <h2 className="font-serif text-2xl">{s.h}</h2>}{s.p && <p className="mt-2 text-espresso/80">{s.p}</p>}
      {s.todo && <p className="mt-2 border border-dashed border-gold px-4 py-3 text-sm text-espresso/70"><strong className="font-medium">To be completed by the store owner:</strong> {s.todo}</p>}</section>))}</div></article>);
}
