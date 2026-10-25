"use client";

import Link from "next/link";
import { AlertTriangle, Info, Lock, ShoppingCart, Store, Trash2, Truck } from "lucide-react";
import { QuantityControl } from "@/components/pdp";
import { useToast } from "@/components/Toast";
import { Button, ProductImage, TrustBadge, buttonClass } from "@/components/ui";
import { formatPrice } from "@/lib/data";
import { useCartProducts } from "@/lib/useCartProducts";

export function CartView() {
  const cart = useCartProducts();
  const toast = useToast();

  if (cart.loading) {
    return (
      <div aria-busy="true" aria-label="Loading cart" className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-48 animate-pulse rounded-card bg-surface-muted" />
      </div>
    );
  }

  if (cart.error) {
    return (
      <div role="alert" className="rounded-card border border-danger/40 bg-danger-soft p-6 text-sm">
        <p className="font-semibold text-danger">We couldn&apos;t load your cart.</p>
        <p className="mt-1">Check your connection and try again. Your items are still saved on this device.</p>
        <Button variant="secondary" className="mt-3" onClick={cart.reload}>
          Try again
        </Button>
      </div>
    );
  }

  if (!cart.lines.length) {
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

  function onRemove(id: string, title: string) {
    const removed = cart.remove(id);
    if (removed) toast({ tone: "info", message: `Removed ${title}.`, action: { label: "Undo", onClick: () => cart.restore(removed) } });
  }

  const blocked = cart.overStock.length > 0 || cart.missingOptions.length > 0 || cart.groups.length === 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="space-y-4">
        {cart.unavailable.length > 0 && (
          <div role="alert" className="rounded-card border border-danger/40 bg-danger-soft p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-danger">
              <AlertTriangle aria-hidden className="size-4" /> {cart.unavailable.length} item
              {cart.unavailable.length === 1 ? " is" : "s are"} no longer available
            </p>
            <p className="mt-1">The store removed or paused {cart.unavailable.length === 1 ? "it" : "them"}.</p>
            <Button variant="secondary" className="mt-3" onClick={() => cart.unavailable.forEach((r) => cart.remove(r.id))}>
              Remove unavailable items
            </Button>
          </div>
        )}

        {cart.overStock.length > 0 && (
          <div role="alert" className="flex gap-3 rounded-card border border-danger/40 bg-danger-soft p-4 text-sm">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-danger">Some quantities are no longer available</p>
              <p className="mt-0.5">Lower the quantity below before checkout. Stock is confirmed again when you place the order.</p>
            </div>
          </div>
        )}

        {cart.groups.length > 1 && (
          <p className="flex items-start gap-2 text-sm text-ink-secondary">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
            Items from {cart.groups.length} stores. Each store packs and ships separately, so delivery fees are charged per store.
          </p>
        )}

        {cart.groups.map((g) => {
          const toFree = g.store.freeDeliveryOver != null ? g.store.freeDeliveryOver - g.subtotal : 0;
          return (
            <section key={g.store.id} aria-labelledby={`g-${g.store.id}`} className="rounded-card border border-border bg-surface">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3">
                <Store aria-hidden className="size-5 text-ink-secondary" />
                <h2 id={`g-${g.store.id}`} className="font-heading text-base font-bold">
                  <Link href={`/search?store=${g.store.slug}`} className="hover:underline">
                    {g.store.name}
                  </Link>
                </h2>
                {g.store.verified && <TrustBadge verified explanation="Store details checked by HomeBEZ" />}
                <span className="text-xs text-ink-secondary sm:ml-auto">
                  Ships from {g.store.city} in {g.store.dispatchDays}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {g.rows.map((r) => {
                  const over = r.qty > r.product.stock;
                  const needsOption = r.product.options.some((o) => !o.values.includes(r.options[o.name] ?? ""));
                  const variant = Object.entries(r.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ");
                  const qty = (
                    <QuantityControl
                      size="sm"
                      value={r.qty}
                      max={Math.max(1, r.product.stock)}
                      onChange={(n) => cart.setQty(r.id, n)}
                      label={r.product.title}
                    />
                  );
                  const removeBtn = (compact: boolean) => (
                    <button
                      type="button"
                      onClick={() => onRemove(r.id, r.product.title)}
                      aria-label={compact ? `Remove ${r.product.title}` : undefined}
                      className={
                        compact
                          ? "grid size-10 place-items-center rounded-control text-ink-secondary hover:bg-danger-soft hover:text-danger"
                          : "flex min-h-9 items-center gap-1 rounded-control px-2 text-xs font-medium text-ink-secondary hover:bg-danger-soft hover:text-danger"
                      }
                    >
                      <Trash2 aria-hidden className={compact ? "size-4" : "size-3.5"} />
                      {!compact && "Remove"}
                    </button>
                  );
                  return (
                    <li key={r.id} className="grid grid-cols-[80px_1fr] gap-3 p-4 sm:grid-cols-[96px_1fr_auto]">
                      <Link href={`/product/${r.product.slug}`} tabIndex={-1} aria-hidden className="overflow-hidden rounded-control">
                        <ProductImage src={r.product.image} category={r.product.category} alt="" />
                      </Link>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-medium">
                          <Link href={`/product/${r.product.slug}`} className="hover:underline">
                            {r.product.title}
                          </Link>
                        </h3>
                        {variant && <p className="mt-0.5 text-xs text-ink-secondary">{variant}</p>}
                        <p className="tabular mt-1 text-sm font-semibold">{formatPrice(r.product.price)}</p>
                        {over && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-danger">
                            <AlertTriangle aria-hidden className="size-3.5" />
                            {r.product.stock === 0 ? "Sold out." : `Only ${r.product.stock} available — you have ${r.qty}.`}
                          </p>
                        )}
                        {needsOption && (
                          <p className="mt-1 text-xs font-medium text-danger">
                            The store changed this product&apos;s options.{" "}
                            <Link href={`/product/${r.product.slug}`} className="underline">
                              Choose again
                            </Link>
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3 sm:hidden">
                          {qty}
                          {removeBtn(true)}
                        </div>
                      </div>
                      <div className="hidden flex-col items-end gap-2 sm:flex">
                        <p className="tabular text-base font-bold">{formatPrice(r.product.price * r.qty)}</p>
                        {qty}
                        {removeBtn(false)}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <footer className="tabular flex flex-wrap items-center justify-between gap-2 border-t border-border bg-canvas/60 px-4 py-3 text-sm">
                <span className="flex items-center gap-1.5 text-ink-secondary">
                  <Truck aria-hidden className="size-4" />
                  {g.fee === 0 ? (
                    <span className="font-medium text-green">Free delivery from this store</span>
                  ) : (
                    <span>
                      Delivery {formatPrice(g.fee)}
                      {toFree > 0 && ` · add ${formatPrice(toFree)} more for free delivery`}
                    </span>
                  )}
                </span>
                <span>
                  Store subtotal <strong>{formatPrice(g.subtotal + g.fee)}</strong>
                </span>
              </footer>
            </section>
          );
        })}
      </div>

      {cart.groups.length > 0 && (
        <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-border bg-surface p-4 lg:p-5">
            <h2 id="summary-title" className="text-[20px] font-bold leading-7">
              Order summary
            </h2>
            <dl className="tabular mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Items ({cart.itemCount})</dt>
                <dd>{formatPrice(cart.itemsTotal)}</dd>
              </div>
              {cart.groups.map((g) => (
                <div key={g.store.id} className="flex justify-between text-ink-secondary">
                  <dt>Delivery · {g.store.name}</dt>
                  <dd>{g.fee === 0 ? "Free" : formatPrice(g.fee)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <dt>Total (PKR)</dt>
                <dd>{formatPrice(cart.itemsTotal + cart.deliveryTotal)}</dd>
              </div>
            </dl>
            {blocked ? (
              <Button size="lg" className="mt-4 w-full" disabled aria-describedby="checkout-note">
                <Lock aria-hidden className="size-4" /> Proceed to checkout
              </Button>
            ) : (
              <Link href="/checkout" className={buttonClass("primary", "lg", "mt-4 w-full")}>
                <Lock aria-hidden className="size-4" /> Proceed to checkout
              </Link>
            )}
            <p id="checkout-note" className="mt-2 text-center text-xs text-ink-secondary">
              {blocked ? "Fix the items marked above to continue." : "Cash on delivery. No account needed."}
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
