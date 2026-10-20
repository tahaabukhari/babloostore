import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, ChevronRight, MapPin, RotateCcw, ShieldCheck, Star, Store, Truck } from "lucide-react";
import { formatPrice, getCategory, getProduct, getStore, products } from "@/lib/data";
import { Gallery, PurchasePanel } from "@/components/pdp";
import { ProductRow } from "@/components/ProductCard";
import { Price, Rating, SectionHeader, TrustBadge, buttonClass } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return { title: p?.title ?? "Product not found" };
}

const sampleReviews = [
  { name: "Ayesha K.", city: "Lahore", rating: 5, date: "12 Oct 2026", body: "Exactly as pictured. Packed well and arrived in two days." },
  { name: "Hamza R.", city: "Rawalpindi", rating: 4, date: "3 Oct 2026", body: "Good quality for the price. Colour slightly lighter than on my screen." },
];

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const store = getStore(product.store);
  const category = getCategory(product.category)!;
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 6);
  const fromStore = products.filter((p) => p.store === product.store && p.slug !== product.slug).slice(0, 6);
  const freeOver = store.freeDeliveryOver;

  return (
    <div className="container-hb pb-24 pt-4 sm:pb-0 lg:pt-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-secondary">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li>
            <Link href={`/search?category=${category.slug}`} className="hover:underline">
              {category.name}
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li aria-current="page" className="line-clamp-1 text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px] lg:gap-8">
        <Gallery product={product} />

        <div className="space-y-5">
          <div>
            <Link href={`/search?store=${store.slug}`} className="text-sm font-semibold text-gold-ink hover:underline">
              {product.brand}
            </Link>
            <h1 className="mt-1 text-[22px] font-bold leading-[30px] lg:text-[28px] lg:leading-9">{product.title}</h1>
            <div className="mt-2">
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
          </div>
          <div className="border-y border-border py-4">
            <Price price={product.price} compareAt={product.compareAt} size="detail" />
            {product.compareAt && (
              <p className="mt-1 text-xs text-ink-secondary">Compared with this store&apos;s price over the last 30 days.</p>
            )}
          </div>
          <PurchasePanel product={product} />
          <section aria-labelledby="hl-title">
            <h2 id="hl-title" className="mb-2 text-base font-bold">
              Highlights
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-secondary">{product.description}</p>
          </section>
        </div>

        {/* Delivery, seller and policy column */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Delivery and seller">
          <div className="rounded-card border border-border bg-surface p-4 text-sm">
            <h2 className="mb-3 text-base font-bold">Delivery</h2>
            <ul className="space-y-3">
              <li className="flex gap-2.5">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>
                  Delivery to <strong>Lahore</strong>{" "}
                  <button type="button" className="font-semibold text-info underline underline-offset-2">
                    Change
                  </button>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>
                  Ships from {store.city} in {store.dispatchDays}; usually arrives 2–4 days after dispatch.
                  <span className="tabular block text-ink-secondary">
                    Delivery fee {formatPrice(store.deliveryFee)}
                    {freeOver ? ` · free on orders from this store over ${formatPrice(freeOver)}` : ""}
                  </span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Banknote aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>Cash on delivery available</span>
              </li>
              <li className="flex gap-2.5">
                <RotateCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>{store.returnPolicy}</span>
              </li>
              {product.warranty && (
                <li className="flex gap-2.5">
                  <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                  <span>{product.warranty}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-surface p-4 text-sm">
            <p className="text-xs text-ink-secondary">Sold and shipped by</p>
            <div className="mt-1 flex items-center gap-2">
              <Store aria-hidden className="size-5 text-ink-secondary" />
              <h2 className="font-heading text-base font-bold">{store.name}</h2>
            </div>
            <p className="mt-0.5 text-xs text-ink-secondary">
              {store.city} · on HomeBEZ since {store.since}
            </p>
            <div className="mt-3">
              <TrustBadge verified={store.verified} explanation={store.verification} />
              {store.verified && <p className="mt-2 text-xs text-ink-secondary">{store.verification}.</p>}
            </div>
            <Link href={`/search?store=${store.slug}`} className={buttonClass("secondary", "md", "mt-4 w-full")}>
              View store
            </Link>
          </div>
        </aside>
      </div>

      <section aria-labelledby="reviews-title" className="mt-12">
        <SectionHeader id="reviews-title" title="Ratings and reviews" subtitle="From verified buyers of this product" />
        {product.reviewCount ? (
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="tabular font-heading text-[40px] font-extrabold leading-none">{product.rating?.toFixed(1)}</p>
              <p className="mt-1 text-sm text-ink-secondary">
                out of 5 · {product.reviewCount} reviews
              </p>
            </div>
            <ul className="space-y-3">
              {sampleReviews.map((r) => (
                <li key={r.name} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-center gap-1" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} aria-hidden className={`size-4 ${i < r.rating ? "fill-gold text-gold-ink" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm">{r.body}</p>
                  <p className="mt-2 text-xs text-ink-secondary">
                    {r.name}, {r.city} · {r.date} · Verified purchase
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-control bg-surface p-6 text-sm text-ink-secondary">
            No reviews yet. Reviews open to buyers after delivery.
          </p>
        )}
      </section>

      {fromStore.length > 0 && (
        <section aria-labelledby="store-more" className="mt-12">
          <SectionHeader id="store-more" title={`More from ${store.name}`} href={`/search?store=${store.slug}`} />
          <ProductRow products={fromStore} label={`More from ${store.name}`} />
        </section>
      )}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-12">
          <SectionHeader id="related" title={`More in ${category.name}`} href={`/search?category=${category.slug}`} />
          <ProductRow products={related} label={`More in ${category.name}`} />
        </section>
      )}
    </div>
  );
}
