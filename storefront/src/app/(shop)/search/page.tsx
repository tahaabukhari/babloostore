import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { Suspense } from "react";
import { FilterSidebar, MobileFilterButton, SelectedChips, SortSelect } from "@/components/Filters";
import { ProductGrid } from "@/components/ProductCard";
import { TrustBadge } from "@/components/ui";
import { countProducts, getPublicStore, listStores, searchProducts } from "@/lib/catalog";
import { categories, getCategory, type SearchParams } from "@/lib/data";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const cat = sp.category ? getCategory(sp.category)?.name : undefined;
  const store = sp.store ? await getPublicStore(sp.store) : null;
  return { title: sp.q ? `“${sp.q}”` : (store?.name ?? cat ?? "All products") };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [results, total, stores, store] = await Promise.all([
    searchProducts(sp),
    countProducts(sp),
    listStores(),
    sp.store ? getPublicStore(sp.store) : Promise.resolve(null),
  ]);
  const category = sp.category ? getCategory(sp.category) : undefined;
  const heading = sp.q ? `Results for “${sp.q}”` : store ? store.name : (category?.name ?? "All products");
  const filtered = !!(sp.q || sp.category || sp.store || sp.min || sp.max || sp.instock);

  return (
    <div className="container-hb py-4 lg:py-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink-secondary">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3" />
          <li aria-current="page" className="text-ink">
            {store ? "Store" : (category?.name ?? (sp.q ? "Search" : "All products"))}
          </li>
        </ol>
      </nav>

      {store && (
        <section className="mb-5 rounded-card border border-border bg-surface p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[20px] font-bold leading-7">{store.name}</h2>
            {store.verified && <TrustBadge verified explanation="Store details checked by BablooStore" />}
          </div>
          {store.tagline && <p className="mt-1 text-sm">{store.tagline}</p>}
          <p className="mt-1 text-sm text-ink-secondary">
            {store.city} · Dispatches in {store.dispatchDays}
            {store.returnPolicy && ` · ${store.returnPolicy}`}
          </p>
          {store.description && <p className="mt-2 max-w-3xl whitespace-pre-line text-sm text-ink-secondary">{store.description}</p>}
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-10">{heading}</h1>
          <p className="tabular mt-1 text-sm text-ink-secondary" aria-live="polite">
            {total} {total === 1 ? "product" : "products"}
            {total > results.length && ` · showing the first ${results.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <MobileFilterButton stores={stores} />
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <div className="mb-4">
        <Suspense>
          <SelectedChips stores={stores} />
        </Suspense>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Suspense>
          <FilterSidebar stores={stores} />
        </Suspense>
        <div>
          {results.length ? (
            <ProductGrid products={results} cols="filters" />
          ) : (
            <div className="flex flex-col items-center rounded-card border border-dashed border-control bg-surface px-6 py-12 text-center">
              <SearchX aria-hidden className="size-10 text-ink-secondary" />
              <h2 className="mt-3 text-[20px] font-bold leading-7">
                {filtered ? `No products match${sp.q ? ` “${sp.q}”` : ""}` : "No products yet"}
              </h2>
              <p className="mt-1 max-w-md text-sm text-ink-secondary">
                {filtered
                  ? "Check the spelling, try a more general word, or remove a filter. Roman Urdu works too — try “khushbu” or “kapray”."
                  : "Stores are adding their products. Check back soon."}
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/search?category=${c.slug}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-control bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
                    >
                      {c.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
