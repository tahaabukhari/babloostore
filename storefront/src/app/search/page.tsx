import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { Suspense } from "react";
import { categories, getCategory, getStore, searchProducts, type SearchParams } from "@/lib/data";
import { FilterSidebar, MobileFilterButton, SelectedChips, SortSelect } from "@/components/Filters";
import { ProductGrid } from "@/components/ProductCard";
import { TrustBadge } from "@/components/ui";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const cat = sp.category ? getCategory(sp.category)?.name : undefined;
  return { title: sp.q ? `“${sp.q}”` : (cat ?? "All products") };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const results = searchProducts(sp);
  const category = sp.category ? getCategory(sp.category) : undefined;
  const store = sp.store ? getStore(sp.store) : undefined;
  const heading = sp.q ? `Results for “${sp.q}”` : store ? store.name : (category?.name ?? "All products");

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
            {category?.name ?? (sp.q ? "Search" : "All products")}
          </li>
        </ol>
      </nav>

      {store && (
        <section className="mb-5 rounded-card border border-border bg-surface p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[20px] font-bold leading-7">{store.name}</h2>
            <TrustBadge verified={store.verified} explanation={store.verification} />
          </div>
          <p className="mt-1 text-sm text-ink-secondary">
            {store.city} · on HomeBEZ since {store.since} · Dispatches in {store.dispatchDays} · {store.returnPolicy}
          </p>
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-10">{heading}</h1>
          <p className="tabular mt-1 text-sm text-ink-secondary" aria-live="polite">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <MobileFilterButton />
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <div className="mb-4">
        <Suspense>
          <SelectedChips />
        </Suspense>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Suspense>
          <FilterSidebar />
        </Suspense>
        <div>
          {results.length ? (
            <ProductGrid products={results} cols="filters" />
          ) : (
            <div className="flex flex-col items-center rounded-card border border-dashed border-control bg-surface px-6 py-12 text-center">
              <SearchX aria-hidden className="size-10 text-ink-secondary" />
              <h2 className="mt-3 text-[20px] font-bold leading-7">No products match{sp.q ? ` “${sp.q}”` : ""}</h2>
              <p className="mt-1 max-w-md text-sm text-ink-secondary">
                Check the spelling, try a more general word, or remove a filter. Roman Urdu works too — try “khushbu” or
                “kapray”.
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
