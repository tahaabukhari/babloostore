import type { Metadata } from "next";
import { getProduct, getStore } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Button, Price, Rating, StatusLabel, StockLine, TrustBadge, type OrderStatus } from "@/components/ui";
import { FormFieldDemo, LoadingButtonDemo, QuantityDemo, ToastDemo, VariantDemo } from "./DesignKit";

export const metadata: Metadata = { title: "Design review kit" };

const colors = [
  ["canvas", "#F7F5EF"],
  ["surface", "#FFFFFF"],
  ["surface-muted", "#F0EDE5"],
  ["ink", "#191A18"],
  ["ink-secondary", "#55584F"],
  ["gold", "#F4C451"],
  ["gold-hover", "#E7B33B"],
  ["gold-soft", "#FFF2C7"],
  ["gold-ink", "#735008"],
  ["green", "#216448"],
  ["green-soft", "#E8F2EC"],
  ["danger", "#B42318"],
  ["danger-soft", "#FFF0ED"],
  ["info / focus", "#2857A4"],
  ["border", "#DEDFD8"],
  ["control-border", "#7A7D73"],
];

const type = [
  { name: "Campaign heading", cls: "font-heading text-[30px] leading-9 lg:text-[48px] lg:leading-[56px] font-extrabold", spec: "48/56 · 30/36" },
  { name: "Page heading", cls: "font-heading text-[26px] leading-[34px] lg:text-[32px] lg:leading-10 font-bold", spec: "32/40 · 26/34" },
  { name: "Section heading", cls: "font-heading text-[20px] leading-7 lg:text-[24px] lg:leading-8 font-bold", spec: "24/32 · 20/28" },
  { name: "Product price", cls: "tabular text-[18px] leading-6 lg:text-[20px] lg:leading-7 font-bold", spec: "20/28 · 18/24", sample: "Rs. 2,490" },
  { name: "Body", cls: "text-base", spec: "16/24" },
  { name: "Product title / UI label", cls: "text-sm font-medium", spec: "14/20" },
  { name: "Supporting metadata", cls: "text-xs text-ink-secondary", spec: "12/18" },
];

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 lg:p-6" aria-labelledby={title.replace(/\W+/g, "-")}>
      <h2 id={title.replace(/\W+/g, "-")} className="text-[20px] font-bold leading-7">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-ink-secondary">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DesignKitPage() {
  const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "refunded", "rejected"];
  const cards = ["printed-lawn-3pc-suit", "matte-lip-set", "sunglasses-uv400", "accent-armchair"].map((s) => getProduct(s)!);

  return (
    <div className="container-hb space-y-6 py-6">
      <div>
        <h1 className="text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-10">Design review kit</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
          Pass 1 components and interaction states built on the locked v1 tokens. Use Tab to review focus order and
          rings; hover states use 150 ms transitions and are disabled under reduced motion.
        </p>
      </div>

      <Block title="Colour tokens" note="Ink on gold for primary actions; white on gold is disallowed.">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {colors.map(([name, hex]) => (
            <li key={name}>
              <div className="h-14 rounded-control border border-border" style={{ background: hex }} />
              <p className="mt-1 text-xs font-semibold">{name}</p>
              <p className="tabular text-xs text-ink-secondary">{hex}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Type scale" note="Manrope for headings, Inter for interface and prices (tabular numerals). Sizes: desktop · mobile.">
        <ul className="divide-y divide-border">
          {type.map((t) => (
            <li key={t.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
              <span className={t.cls}>{t.sample ?? t.name}</span>
              <span className="tabular shrink-0 text-xs text-ink-secondary">{t.spec}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Buttons" note="44 px minimum target. Loading state blocks duplicate submission.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Add to cart</Button>
          <Button variant="secondary">View store</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Remove</Button>
          <Button disabled>Sold out</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <LoadingButtonDemo />
          <Button size="lg">Large primary</Button>
        </div>
        <div className="on-dark mt-4 flex flex-wrap items-center gap-3 rounded-card bg-ink p-4">
          <Button>On charcoal</Button>
          <a href="#" className="rounded-md px-2 text-sm text-white underline">
            Link on dark — tab to see soft-gold focus ring
          </a>
        </div>
      </Block>

      <Block title="Product cards" note="Default · sold out · no reviews · high price. Wishlist is a separate control; title link covers the card.">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
          {cards.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Block>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Variant selector" note="Text label plus swatch; unavailable options explain why; selection required before add to cart.">
          <VariantDemo />
        </Block>
        <Block title="Quantity control" note="Accessible names and inventory limit feedback.">
          <QuantityDemo />
        </Block>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Status labels" note="Text plus icon plus colour — never colour alone.">
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <StatusLabel key={s} status={s} />
            ))}
          </div>
        </Block>
        <Block title="Trust, stock, price, rating">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <TrustBadge verified explanation={getStore("noor-textiles").verification} />
              <TrustBadge verified={false} explanation="Verification in progress" />
            </div>
            <div className="flex flex-wrap gap-4">
              <StockLine stock={20} />
              <StockLine stock={3} />
              <StockLine stock={0} />
            </div>
            <Price price={2490} compareAt={2990} />
            <div className="flex gap-4">
              <Rating value={4.6} count={128} />
              <Rating />
            </div>
          </div>
        </Block>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Form field" note="Persistent label, helper text, inline error and error summary. Submit to see errors.">
          <FormFieldDemo />
        </Block>
        <Block title="Toasts" note="Announced politely; critical failures also stay beside the action that failed.">
          <ToastDemo />
        </Block>
      </div>

      <Block title="Review checklist (from design system)">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            "Home at 1440, 1024, 768, 390 and 320 px — no horizontal scroll",
            "Search with long names and empty results — try “zzz”",
            "Sold-out variant — Kurta size XL, Lawn suit Ivory",
            "Two-seller cart — seeded on first visit (3 stores)",
            "Stock conflict in cart — brass lamp qty 3 vs 2 available",
            "Keyboard: search suggestions, gallery arrows, drawers trap focus and Esc closes",
            "Mobile filters apply explicitly; focus returns to the Filters button",
            "Load more keeps count in URL (?shown=) for back navigation",
          ].map((i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-ink" />
              {i}
            </li>
          ))}
        </ul>
      </Block>
    </div>
  );
}
