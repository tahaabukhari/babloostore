"use client";

import Link from "next/link";
import { AlertTriangle, Info, Lock, ShoppingCart, Store, Trash2, Truck } from "lucide-react";
import { formatPrice, getProduct, getStore, products, type Product } from "@/lib/data";
import { useCart, type CartLine } from "@/lib/cart";
import { QuantityControl } from "@/components/pdp";
import { ProductRow } from "@/components/ProductCard";
import { useToast } from "@/components/Toast";
import { Button, ProductArt, SectionHeader, TrustBadge, buttonClass } from "@/components/ui";

type Row = CartLine & { product: Product };

function storeDelivery(storeSlug: string, subtotal: number) {
  const s = getStore(storeSlug);
  return s.freeDeliveryOver && subtotal >= s.freeDeliveryOver ? 0 : s.deliveryFee;
}

export function CartView() {
  const { lines, ready, setQty, remove, restore } = useCart();
  const toast = useToast();

  if (!ready) {
    return (
      <div aria-busy="true" aria-label="Loading cart" className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-48 animate-pulse rounded-card bg-surface-muted" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center rounded-card border border-dashed border-control bg-surface px-6 py-14 text-center">
        <ShoppingCart aria-hidden className="size-10 text-ink-secondary" />
        <h2 className="mt-3 text-[20px] font-bold leading-7">Your cart is empty</h2>
        <p className="mt-1 text-sm text-ink-secondary">Items you add from any store will be grouped here by seller.</p>
        <Link href="/" className={buttonClass("primary", "lg", "mt-5")}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const rows: Row[] = lines.map((l) => ({ ...l, product: getProduct(l.slug)! }));
  const groups = Object.entries(
    rows.reduce<Record<string, Row[]>>((acc, r) => {
      (acc[r.product.store] ??= []).push(r);
      return acc;
    }, {}),
  );

  const itemsTotal = rows.reduce((n, r) => n + r.product.price * r.qty, 0);
  const deliveryTotal = groups.reduce(
    (n, [store, rs]) => n + storeDelivery(store, rs.reduce((m, r) => m + r.product.price * r.qty, 0)),
    0,
  );
  const issues = rows.filter((r) => r.qty > r.product.stock);
  const count = rows.reduce((n, r) => n + r.qty, 0);

  function onRemove(r: Row) {
    const removed = remove(r.id);
    if (removed)
      toast({ tone: "info", message: `Removed ${r.product.title}.`, action: { label: "Undo", onClick: () => restore(removed) } });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="space-y-4">
        {issues.length > 0 && (
          <div role="alert" className="flex gap-3 rounded-card border border-danger/40 bg-danger-soft p-4 text-sm">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-danger">Some quantities are no longer available</p>
              <p className="mt-0.5">Lower the quantity below before checkout. Stock is confirmed again when you place the order.</p>
            </div>
          </div>
        )}

        <p className="flex items-start gap-2 text-sm text-ink-secondary">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
          Items from {groups.length} {groups.length === 1 ? "store" : "stores"}. Each store packs and ships separately, so
          delivery fees are charged per store.
        </p>

        {groups.map(([storeSlug, rs]) => {
          const store = getStore(storeSlug);
          const sub = rs.reduce((m, r) => m + r.product.price * r.qty, 0);
          const fee = storeDelivery(storeSlug, sub);
          const toFree = store.freeDeliveryOver ? store.freeDeliveryOver - sub : 0;
          return (
            <section key={storeSlug} aria-labelledby={`g-${storeSlug}`} className="rounded-card border border-border bg-surface">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3">
                <Store aria-hidden className="size-5 text-ink-secondary" />
                <h2 id={`g-${storeSlug}`} className="font-heading text-base font-bold">
                  <Link href={`/search?store=${storeSlug}`} className="hover:underline">
                    {store.name}
                  </Link>
                </h2>
                <TrustBadge verified={store.verified} explanation={store.verification} />
                <span className="text-xs text-ink-secondary sm:ml-auto">
                  Ships from {store.city} in {store.dispatchDays}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {rs.map((r) => {
                  const over = r.qty > r.product.stock;
                  const variant = Object.entries(r.variant)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ");
                  return (
                    <li key={r.id} className="grid grid-cols-[80px_1fr] gap-3 p-4 sm:grid-cols-[96px_1fr_auto]">
                      <Link href={`/product/${r.slug}`} tabIndex={-1} aria-hidden className="overflow-hidden rounded-control">
                        <ProductArt kind={r.product.art} tone={r.product.tone} />
                      </Link>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-medium">
                          <Link href={`/product/${r.slug}`} className="hover:underline">
                            {r.product.title}
                          </Link>
                        </h3>
                        {variant && <p className="mt-0.5 text-xs text-ink-secondary">{variant}</p>}
                        <p className="tabular mt-1 text-sm font-semibold">{formatPrice(r.product.price)}</p>
                        {over && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-danger">
                            <AlertTriangle aria-hidden className="size-3.5" />
                            Only {r.product.stock} available — you have {r.qty}.
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3 sm:hidden">
                          <QuantityControl size="sm" value={r.qty} max={r.product.stock} onChange={(n) => setQty(r.id, n)} label={r.product.title} />
                          <button type="button" onClick={() => onRemove(r)} className="grid size-10 place-items-center rounded-control text-ink-secondary hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${r.product.title}`}>
                            <Trash2 aria-hidden className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="hidden flex-col items-end gap-2 sm:flex">
                        <p className="tabular text-base font-bold">{formatPrice(r.product.price * r.qty)}</p>
                        <QuantityControl size="sm" value={r.qty} max={r.product.stock} onChange={(n) => setQty(r.id, n)} label={r.product.title} />
                        <button type="button" onClick={() => onRemove(r)} className="flex min-h-9 items-center gap-1 rounded-control px-2 text-xs font-medium text-ink-secondary hover:bg-danger-soft hover:text-danger">
                          <Trash2 aria-hidden className="size-3.5" /> Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <footer className="tabular flex flex-wrap items-center justify-between gap-2 border-t border-border bg-canvas/60 px-4 py-3 text-sm">
                <span className="flex items-center gap-1.5 text-ink-secondary">
                  <Truck aria-hidden className="size-4" />
                  {fee === 0 ? (
                    <span className="font-medium text-green">Free delivery from this store</span>
                  ) : (
                    <span>
                      Delivery {formatPrice(fee)}
                      {toFree > 0 && ` · add ${formatPrice(toFree)} more for free delivery`}
                    </span>
                  )}
                </span>
                <span>
                  Store subtotal <strong>{formatPrice(sub + fee)}</strong>
                </span>
              </footer>
            </section>
          );
        })}
      </div>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 id="summary-title" className="text-[20px] font-bold leading-7">
            Order summary
          </h2>
          <dl className="tabular mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Items ({count})</dt>
              <dd>{formatPrice(itemsTotal)}</dd>
            </div>
            {groups.map(([s, rs]) => (
              <div key={s} className="flex justify-between text-ink-secondary">
                <dt>Delivery · {getStore(s).name}</dt>
                <dd>{(() => {
                  const fee = storeDelivery(s, rs.reduce((m, r) => m + r.product.price * r.qty, 0));
                  return fee === 0 ? "Free" : formatPrice(fee);
                })()}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total (PKR)</dt>
              <dd>{formatPrice(itemsTotal + deliveryTotal)}</dd>
            </div>
          </dl>
          <p className="mt-1 text-xs text-ink-secondary">Delivery fees assume Lahore. Final total is confirmed at checkout.</p>
          <Button size="lg" className="mt-4 w-full" disabled={issues.length > 0} aria-describedby="checkout-note">
            <Lock aria-hidden className="size-4" /> Proceed to checkout
          </Button>
          <p id="checkout-note" className="mt-2 text-center text-xs text-ink-secondary">
            {issues.length > 0 ? "Fix the quantities above to continue." : "Guest checkout — no account needed. (Checkout is built in a later pass.)"}
          </p>
        </div>
      </aside>

      <section aria-labelledby="also" className="lg:col-span-2">
        <SectionHeader id="also" title="You might also need" />
        <ProductRow products={products.filter((p) => !lines.some((l) => l.slug === p.slug)).slice(0, 6)} label="Suggestions" />
      </section>
    </div>
  );
}
