
import Link from "next/link";
import { queryProducts } from "@/lib/server/products";
import type { Product } from "@/lib/types";

import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import Newsletter from "@/components/Newsletter";
import { CATEGORIES } from "@/lib/categories";

type ShelfProps = {
  title: string;
  sort: "new" | "high";
};

async function Shelf({ title, sort }: ShelfProps) {
  let items: Product[] = [];
  let failed = false;

  try {
    const result = await queryProducts({
      sort,
      page: 1,
    });

    items = result.items ?? [];
  } catch (error) {
    failed = true;
    console.error(`[${title}] Could not load products:`, error);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pt-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-serif text-3xl">{title}</h2>

        <Link
          href="/shop"
          className="text-sm underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      {failed ? (
        <EmptyState
          title="We couldn't load this collection"
          body="Please refresh in a moment. If the problem continues, check the server logs."
        />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {items.slice(0, 4).map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="The collection is being prepared"
          body="Pieces will appear here as soon as they are added from the admin dashboard."
          href="/shop"
          cta="Go to shop"
        />
      )}
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero section */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-6 pt-16 md:grid-cols-12 md:pt-28">
        <h1 className="font-serif text-5xl leading-[1.05] md:col-span-8 md:text-8xl">
          Jewellery you reach for every morning, and keep for years.
        </h1>

        <div className="md:col-span-4 md:self-end">
          <p className="max-w-sm text-espresso/75">
            Fine and demi-fine pieces in gold tones and considered shapes,
            made for daily wear.
          </p>

          <div className="mt-6 flex gap-4">
            <Link
              href="/shop"
              className="bg-espresso px-7 py-3 text-sm text-ivory transition-colors hover:bg-ink"
            >
              Shop the collection
            </Link>

            <Link
              href="/about"
              className="py-3 text-sm underline underline-offset-4"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        aria-label="Shop by category"
        className="mx-auto mt-16 max-w-7xl px-5"
      >
        <ul className="grid grid-cols-2 border-y border-champagne/60 md:grid-cols-5">
          {CATEGORIES.map(([slug, name]) => (
            <li
              key={slug}
              className="border-champagne/60 md:border-r md:last:border-r-0"
            >
              <Link
                href={`/shop?category=${encodeURIComponent(slug)}`}
                className="block py-8 text-center font-serif text-2xl transition-colors hover:bg-champagne/20 hover:text-gold"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Product collections */}
      <Shelf title="New arrivals" sort="new" />
      <Shelf title="Best sellers" sort="high" />

      {/* Brand story */}
      <section className="mx-auto mt-24 grid max-w-7xl gap-8 px-5 md:grid-cols-2">
        <div
          className="aspect-[4/3] bg-champagne/25"
          role="img"
          aria-label="Brand story photograph placeholder"
        />

        <div className="self-center">
          <h2 className="font-serif text-4xl">
            Made slowly, worn daily
          </h2>

          <p className="mt-4 max-w-md text-espresso/75">
            Discover jewellery designed to become part of your everyday
            story, from thoughtful details to timeless shapes.
          </p>

          <Link
            href="/about"
            className="mt-6 inline-block text-sm underline underline-offset-4"
          >
            Read more
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-24 px-5">
        <Newsletter />
      </section>
    </>
  );
}
