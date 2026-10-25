import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, ChevronRight, MapPin, RotateCcw, ShieldCheck, Store, Truck } from "lucide-react";
import { Gallery, PurchasePanel, toSelectorOptions } from "@/components/pdp";
import { ProductRow } from "@/components/ProductCard";
import { Price, SectionHeader, TrustBadge, buttonClass } from "@/components/ui";
import { getPublicProduct, moreFromStore, relatedProducts } from "@/lib/catalog";
import { formatPrice, getCategory } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getPublicProduct((await params).slug);
  return row
    ? { title: row.product.title, description: row.product.description.slice(0, 160) }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const row = await getPublicProduct((await params).slug);
  if (!row) notFound();
  const { product, store } = row;
  const category = getCategory(product.category);
  const [fromStore, related] = await Promise.all([
    moreFromStore(store.id, product.id),
    relatedProducts(product.category, product.id),
  ]);

  return (
    <div className="container-hb pb-24 pt-4 sm:pb-0 lg:pt-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-secondary">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          {category && (
            <>
              <ChevronRight aria-hidden className="size-3" />
              <li>
                <Link href={`/search?category=${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight aria-hidden className="size-3" />
          <li aria-current="page" className="line-clamp-1 text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px] lg:gap-8">
        <Gallery title={product.title} images={product.images} category={product.category} />

        <div className="space-y-5">
          <div>
            <Link href={`/search?store=${store.slug}`} className="text-sm font-semibold text-gold-ink hover:underline">
              {store.name}
            </Link>
            <h1 className="mt-1 text-[22px] font-bold leading-[30px] lg:text-[28px] lg:leading-9">{product.title}</h1>
          </div>
          <div className="border-y border-border py-4">
            <Price price={product.price} compareAt={product.compareAt ?? undefined} size="detail" />
            {product.compareAt && product.compareAt > product.price && (
              <p className="mt-1 text-xs text-ink-secondary">Compare-at price set by the store.</p>
            )}
          </div>
          <PurchasePanel
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              stock: product.stock,
              options: toSelectorOptions(product.options),
            }}
          />
          {(product.highlights.length > 0 || product.description) && (
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="mb-2 text-base font-bold">
                About this item
              </h2>
              {product.highlights.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {product.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {product.description && <p className="mt-3 whitespace-pre-line text-sm text-ink-secondary">{product.description}</p>}
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Delivery and seller">
          <div className="rounded-card border border-border bg-surface p-4 text-sm">
            <h2 className="mb-3 text-base font-bold">Delivery</h2>
            <ul className="space-y-3">
              <li className="flex gap-2.5">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>Ships from {store.city}</span>
              </li>
              <li className="flex gap-2.5">
                <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>
                  Dispatched in {store.dispatchDays}.
                  <span className="tabular block text-ink-secondary">
                    Delivery fee {store.deliveryFee ? formatPrice(store.deliveryFee) : "free"}
                    {store.freeDeliveryOver != null ? ` · free on orders from this store over ${formatPrice(store.freeDeliveryOver)}` : ""}
                  </span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Banknote aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>Cash on delivery</span>
              </li>
              <li className="flex gap-2.5">
                <RotateCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span>{store.returnPolicy || "Ask the store about returns before ordering."}</span>
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
              {store.city} · on BablooStore since {store.createdAt.getFullYear()}
            </p>
            {store.verified && (
              <div className="mt-3">
                <TrustBadge verified explanation="Store details checked by BablooStore" />
              </div>
            )}
            <Link href={`/search?store=${store.slug}`} className={buttonClass("secondary", "md", "mt-4 w-full")}>
              View store
            </Link>
          </div>
        </aside>
      </div>

      {fromStore.length > 0 && (
        <section aria-labelledby="store-more" className="mt-12">
          <SectionHeader id="store-more" title={`More from ${store.name}`} href={`/search?store=${store.slug}`} />
          <ProductRow products={fromStore} label={`More from ${store.name}`} />
        </section>
      )}
      {related.length > 0 && category && (
        <section aria-labelledby="related" className="mt-12">
          <SectionHeader id="related" title={`More in ${category.name}`} href={`/search?category=${category.slug}`} />
          <ProductRow products={related} label={`More in ${category.name}`} />
        </section>
      )}
    </div>
  );
}
