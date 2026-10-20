import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { budgets, categories, products, stores } from "@/lib/data";
import { Countdown, MoreToDiscover } from "@/components/home";
import { ProductCard, ProductRow } from "@/components/ProductCard";
import { ProductArt, SectionHeader, TrustBadge, buttonClass } from "@/components/ui";

const CAMPAIGN_END = "2026-10-31T18:59:00Z"; // 31 Oct, 11:59 pm PKT

export default function HomePage() {
  const deals = products.filter((p) => p.compareAt).slice(0, 6);
  const upgrades = products.filter((p) => p.category === "home" || p.category === "electronics").slice(0, 4);
  const featuredStores = stores.slice(0, 4);

  return (
    <div className="container-hb space-y-10 py-4 lg:space-y-14 lg:py-6">
      {/* 4. Campaign — editorial panel + curated collection tile; stacks on mobile; no carousel */}
      <section aria-labelledby="campaign-title" className="grid gap-3 lg:grid-cols-[2fr_1fr] lg:gap-5">
        <div className="relative overflow-hidden rounded-campaign bg-ink text-white on-dark">
          <div className="grid items-center gap-4 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Winter lawn edit · until 31 Oct</p>
              <h1
                id="campaign-title"
                className="mt-2 text-[30px] font-extrabold leading-9 lg:text-[48px] lg:leading-[56px]"
              >
                Fresh prints from Faisalabad looms
              </h1>
              <p className="mt-3 max-w-md text-white/80">
                Unstitched and ready-to-wear sets from verified textile stores, with cash on delivery.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/search?category=fashion" className={buttonClass("primary", "lg")}>
                  Shop the edit <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid">
              {products
                .filter((p) => p.category === "fashion")
                .slice(0, 4)
                .map((p, i) => (
                  <ProductArt key={p.slug} kind={p.art} tone={p.tone} angle={i} className="rounded-card" />
                ))}
            </div>
          </div>
        </div>
        <Link
          href="/search?category=beauty"
          className="group relative flex items-center gap-4 overflow-hidden rounded-campaign bg-gold-soft p-5 transition-hb hover:shadow-card lg:flex-col lg:items-start lg:justify-between lg:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-ink">Curated collection</p>
            <h2 className="mt-1 text-[20px] font-bold leading-7 lg:text-[24px] lg:leading-8">Attars for the evening</h2>
            <p className="mt-1 text-sm text-ink-secondary">Alcohol-free blends from Lahore</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-ink group-hover:underline">
              Explore <ArrowRight aria-hidden className="size-4" />
            </span>
          </div>
          <ProductArt kind="perfume" tone="#E8D3A6" className="w-24 shrink-0 rounded-card lg:w-40 lg:self-end" />
        </Link>
      </section>

      {/* 5. Service strip — verified promises only */}
      <section aria-label="Shopping with HomeBEZ">
        <ul className="grid grid-cols-2 gap-3 rounded-card border border-border bg-surface p-3 text-sm lg:grid-cols-4 lg:p-4">
          {[
            { Icon: Banknote, title: "Cash on delivery", body: "Available on all listed stores" },
            { Icon: RotateCcw, title: "Store return rules", body: "Shown on every product before you pay" },
            { Icon: ShieldCheck, title: "Approved sellers only", body: "Every store is reviewed by HomeBEZ" },
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

      {/* Category quick links (mobile-first discovery) */}
      <section aria-labelledby="cat-title">
        <h2 id="cat-title" className="sr-only">
          Shop by category
        </h2>
        <ul className="grid grid-cols-5 gap-2 lg:gap-5">
          {categories.map((c) => {
            const sample = products.find((p) => p.category === c.slug)!;
            return (
              <li key={c.slug}>
                <Link
                  href={`/search?category=${c.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-card p-1 text-center lg:bg-surface lg:p-4 lg:hover:shadow-card"
                >
                  <ProductArt kind={c.icon} tone={sample.tone} className="w-full rounded-full lg:rounded-card" />
                  <span className="text-xs font-semibold leading-4 lg:text-sm">{c.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 6. Deals with a purpose */}
      <section aria-labelledby="deals-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="deals-title" className="text-[20px] font-bold leading-7 lg:text-[24px] lg:leading-8">
              Winter edit deals
            </h2>
            <Countdown endsAt={CAMPAIGN_END} />
          </div>
          <Link href="/search?sort=price-asc" className="text-sm font-semibold text-gold-ink hover:underline">
            View all deals
          </Link>
        </div>
        <ProductRow products={deals} label="Winter edit deals" />
      </section>

      {/* 7. Browse by budget */}
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

      {/* 8. Everyday upgrades */}
      <section aria-labelledby="upgrades-title">
        <SectionHeader id="upgrades-title" title="Everyday upgrades" href="/search?category=home" />
        <div className="grid gap-3 lg:grid-cols-[1fr_2fr] lg:gap-5">
          <Link
            href="/search?category=home"
            className="relative flex min-h-48 flex-col justify-end overflow-hidden rounded-campaign bg-[#EADFC9] p-6 transition-hb hover:shadow-card"
          >
            <ProductArt
              kind="lamp"
              tone="#F4E2B8"
              className="pointer-events-none absolute -right-6 -top-6 w-48 rounded-full bg-transparent opacity-90 lg:w-64"
            />
            <p className="relative text-xs font-semibold uppercase tracking-wide text-gold-ink">Editorial</p>
            <h3 className="relative mt-1 max-w-[16ch] text-[24px] font-bold leading-8">Warm light, cool sheets</h3>
            <p className="relative mt-1 max-w-xs text-sm text-ink-secondary">
              Brass, pottery and percale from Multan makers.
            </p>
          </Link>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {upgrades.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Meet the stores */}
      <section aria-labelledby="stores-title">
        <SectionHeader id="stores-title" title="Meet the stores" subtitle="Approved sellers and what they actually sell" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {featuredStores.map((s) => {
            const items = products.filter((p) => p.store === s.slug).slice(0, 3);
            return (
              <li key={s.slug} className="flex flex-col rounded-card border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-bold">{s.name}</h3>
                    <p className="text-xs text-ink-secondary">
                      {s.city} · on HomeBEZ since {s.since}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <TrustBadge verified={s.verified} explanation={s.verification} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{s.tagline}</p>
                <ul className="mt-3 grid grid-cols-3 gap-2" aria-label={`Products from ${s.name}`}>
                  {items.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/product/${p.slug}`} aria-label={p.title} className="block overflow-hidden rounded-control">
                        <ProductArt kind={p.art} tone={p.tone} />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/search?store=${s.slug}`}
                  className={buttonClass("secondary", "md", "mt-4 w-full")}
                >
                  View store
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 10. More to discover */}
      <section aria-labelledby="more-title">
        <SectionHeader id="more-title" title="More to discover" />
        <Suspense>
          <MoreToDiscover products={[...products].sort((a, b) => a.createdRank - b.createdRank)} />
        </Suspense>
      </section>
    </div>
  );
}
