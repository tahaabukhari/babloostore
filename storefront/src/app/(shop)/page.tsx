import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Banknote, RotateCcw, Store, Truck } from "lucide-react";
import { MoreToDiscover } from "@/components/home";
import { ProductRow } from "@/components/ProductCard";
import { ProductArt, ProductImage, SectionHeader, TrustBadge, buttonClass } from "@/components/ui";
import { dealProducts, featuredStores, latestProducts } from "@/lib/catalog";
import { budgets, categories } from "@/lib/data";

export default async function HomePage() {
  const [latest, deals, stores, discover] = await Promise.all([
    latestProducts(12),
    dealProducts(6),
    featuredStores(4),
    latestProducts(96),
  ]);
  const empty = latest.length === 0;

  return (
    <div className="container-hb space-y-10 py-4 lg:space-y-14 lg:py-6">
      {/* Campaign — one editorial panel; stacks on mobile; no carousel */}
      <section aria-labelledby="campaign-title" className="grid gap-3 lg:grid-cols-[2fr_1fr] lg:gap-5">
        <div className="on-dark relative overflow-hidden rounded-campaign bg-ink text-white">
          <div className="grid items-center gap-4 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Independent Pakistani stores</p>
              <h1 id="campaign-title" className="mt-2 text-[30px] font-extrabold leading-9 lg:text-[48px] lg:leading-[56px]">
                Everything you need, from stores you can trust
              </h1>
              <p className="mt-3 max-w-md text-white/80">
                Fashion, beauty, jewellery, accessories and home — straight from the people who make and sell them. Pay cash on delivery.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/search" className={buttonClass("primary", "lg")}>
                  Browse all products <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid">
              {(latest.length >= 4 ? latest.slice(0, 4) : categories.slice(0, 4)).map((x, i) =>
                "id" in x ? (
                  <ProductImage key={x.id} src={x.image} category={x.category} alt="" className="rounded-card" />
                ) : (
                  <ProductArt key={x.slug} kind={x.icon} tone={x.tone} angle={i} className="rounded-card" />
                ),
              )}
            </div>
          </div>
        </div>
        <Link
          href="/search?sort=newest"
          className="group relative flex items-center gap-4 overflow-hidden rounded-campaign bg-gold-soft p-5 transition-hb hover:shadow-card lg:flex-col lg:items-start lg:justify-between lg:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-ink">Just added</p>
            <h2 className="mt-1 text-[20px] font-bold leading-7 lg:text-[24px] lg:leading-8">New in this week</h2>
            <p className="mt-1 text-sm text-ink-secondary">The latest listings from every store</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-ink group-hover:underline">
              See what&apos;s new <ArrowRight aria-hidden className="size-4" />
            </span>
          </div>
          <ProductArt kind="bag" tone="#E8D3A6" className="w-24 shrink-0 rounded-card lg:w-40 lg:self-end" />
        </Link>
      </section>

      {/* Service strip — only promises that are true today */}
      <section aria-label="Shopping with BablooStore">
        <ul className="grid grid-cols-2 gap-3 rounded-card border border-border bg-surface p-3 text-sm lg:grid-cols-4 lg:p-4">
          {[
            { Icon: Banknote, title: "Cash on delivery", body: "Pay when your parcel arrives" },
            { Icon: RotateCcw, title: "Store return rules", body: "Shown on every product before you order" },
            { Icon: Store, title: "Stores set up by us", body: "Every seller account is created by BablooStore" },
            { Icon: Truck, title: "Delivery fee per store", body: "Each store ships separately" },
          ].map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-2.5">
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-ink" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-xs text-ink-secondary">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cat-title">
        <h2 id="cat-title" className="sr-only">
          Shop by category
        </h2>
        <ul className="grid grid-cols-5 gap-2 lg:gap-5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/search?category=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-card p-1 text-center lg:bg-surface lg:p-4 lg:hover:shadow-card"
              >
                <ProductArt kind={c.icon} tone={c.tone} className="w-full rounded-full lg:rounded-card" />
                <span className="text-xs font-semibold leading-4 lg:text-sm">{c.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {empty ? (
        <section className="rounded-card border border-dashed border-control bg-surface px-6 py-12 text-center">
          <h2 className="text-[20px] font-bold leading-7">Stores are setting up</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-secondary">
            Products will appear here as soon as our first stores publish them. Check back soon.
          </p>
        </section>
      ) : (
        <>
          <section aria-labelledby="new-title">
            <SectionHeader id="new-title" title="New arrivals" href="/search?sort=newest" />
            <ProductRow products={latest.slice(0, 6)} label="New arrivals" />
          </section>

          {deals.length > 0 && (
            <section aria-labelledby="deals-title">
              <SectionHeader id="deals-title" title="Reduced prices" subtitle="Compare-at prices set by each store" href="/search?sort=price-asc" />
              <ProductRow products={deals} label="Reduced prices" />
            </section>
          )}

          <section aria-labelledby="budget-title">
            <SectionHeader id="budget-title" title="Shop by budget" subtitle="Useful price points in PKR" />
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {budgets.map((b, i) => (
                <li key={b.label}>
                  <Link
                    href={`/search?max=${b.max}`}
                    className={`flex min-h-20 items-center justify-between rounded-card border p-4 font-heading font-bold transition-hb hover:shadow-card ${
                      i === 3 ? "border-gold bg-gold-soft" : "border-border bg-surface"
                    }`}
                  >
                    <span className="tabular">{b.label}</span>
                    <ArrowRight aria-hidden className="size-5 text-gold-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {stores.length > 0 && (
            <section aria-labelledby="stores-title">
              <SectionHeader id="stores-title" title="Meet the stores" subtitle="The people behind the products" />
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {stores.map((s) => (
                  <li key={s.slug} className="flex flex-col rounded-card border border-border bg-surface p-4">
                    <h3 className="font-heading text-base font-bold">{s.name}</h3>
                    <p className="text-xs text-ink-secondary">
                      {s.city} · {s.productCount} product{s.productCount === 1 ? "" : "s"}
                    </p>
                    {s.verified && (
                      <div className="mt-2">
                        <TrustBadge verified explanation="Store details checked by BablooStore" />
                      </div>
                    )}
                    {s.tagline && <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{s.tagline}</p>}
                    <ul className="mt-3 grid grid-cols-3 gap-2" aria-label={`Products from ${s.name}`}>
                      {s.items.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/product/${p.slug}`} aria-label={p.title} className="block overflow-hidden rounded-control">
                            <ProductImage src={p.image} category={p.category} alt="" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/search?store=${s.slug}`} className={buttonClass("secondary", "md", "mt-auto w-full")}>
                      View store
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="more-title">
            <SectionHeader id="more-title" title="More to discover" />
            <Suspense>
              <MoreToDiscover products={discover} />
            </Suspense>
          </section>
        </>
      )}
    </div>
  );
}
