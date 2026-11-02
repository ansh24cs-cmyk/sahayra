import { cache } from "react"; import { notFound } from "next/navigation";
import { queryProductBySlug, queryProducts } from "@/lib/server/products"; import ProductDetail from "@/components/ProductDetail"; import ProductCard from "@/components/ProductCard";
const getProduct = cache((slug: string) => queryProductBySlug(slug).catch(() => null));
export async function generateMetadata({ params }: { params: { slug: string } }) { const p = await getProduct(params.slug); return p ? { title: p.name, description: (p.description || `${p.name}, ${p.material}`).slice(0, 160) } : { title: "Product not found" }; }
export default async function Page({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug); if (!p) notFound();
  const related = (await queryProducts({ category: p.category }).catch(() => ({ items: [] }))).items.filter((x) => x.id !== p.id).slice(0, 4);
  return (<><ProductDetail product={p} />{related.length > 0 && <section className="mx-auto max-w-7xl px-5 pb-10"><h2 className="mb-8 font-serif text-3xl">You may also like</h2><div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>}</>);
}
