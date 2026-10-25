"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Banknote, Lock } from "lucide-react";
import { placeOrder } from "@/app/actions/checkout";
import { Field, Select, TextArea } from "@/components/form";
import { Button, ProductImage, buttonClass } from "@/components/ui";
import { deliveryCities, formatPrice } from "@/lib/data";
import { useCartProducts } from "@/lib/useCartProducts";

export function CheckoutForm() {
  const cart = useCartProducts();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error || Object.keys(fieldErrors).length) summaryRef.current?.focus();
  }, [error, fieldErrors]);

  if (cart.loading) return <div aria-busy="true" className="h-96 animate-pulse rounded-card bg-surface-muted" />;

  if (!placed && (!cart.groups.length || cart.overStock.length || cart.unavailable.length || cart.missingOptions.length)) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 text-center">
        <p className="font-semibold">{cart.groups.length ? "Your cart needs a quick fix before checkout." : "Your cart is empty."}</p>
        <Link href={cart.groups.length ? "/cart" : "/"} className={buttonClass("primary", "md", "mt-4")}>
          {cart.groups.length ? "Back to cart" : "Continue shopping"}
        </Link>
      </div>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return; // duplicate-submit guard
    const contact = Object.fromEntries(new FormData(e.currentTarget));
    const lines = cart.lines.map(({ productId, qty, options }) => ({ productId, qty, options }));
    setError(undefined);
    setFieldErrors({});
    start(async () => {
      const res = await placeOrder(contact, lines);
      if (res.ok) {
        setPlaced(true);
        cart.clear();
        router.push(`/order/${res.checkoutId}`);
      } else {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        if (res.staleIds?.length) cart.reload();
      }
    });
  }

  const fe = fieldErrors;
  const errorCount = Object.keys(fe).length;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
      <div className="space-y-5">
        {(error || errorCount > 0) && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-card border border-danger/40 bg-danger-soft p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-danger">
              <AlertCircle aria-hidden className="size-4" /> {error}
            </p>
            {errorCount > 0 && (
              <ul className="mt-1 list-disc pl-6">
                {Object.entries(fe).map(([k, msg]) => (
                  <li key={k}>
                    <a href={`#${k}`} className="underline">
                      {msg}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 className="text-[20px] font-bold leading-7">Delivery details</h2>
          <p className="text-sm text-ink-secondary">Each store receives these details to deliver your order and may call to confirm.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Full name" autoComplete="name" error={fe.name} required />
            <Field
              name="phone"
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              help="The courier calls this number."
              error={fe.phone}
              required
            />
          </div>
          <Field
            name="email"
            label="Email (optional)"
            type="email"
            autoComplete="email"
            help="For your order confirmation."
            error={fe.email}
          />
          <TextArea name="address" label="Address" autoComplete="street-address" rows={2} help="House / flat, street, area, nearby landmark." error={fe.address} required />
          <Select
            name="city"
            label="City"
            defaultValue="Lahore"
            error={fe.city}
            options={deliveryCities.map((c) => ({ value: c, label: c }))}
          />
          <TextArea name="notes" label="Notes for the store (optional)" rows={2} error={fe.notes} />
        </section>

        <section className="rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 className="text-[20px] font-bold leading-7">Payment</h2>
          <label className="mt-3 flex items-center gap-3 rounded-control border-2 border-ink bg-gold-soft p-3 text-sm">
            <input type="radio" name="payment" value="cod" defaultChecked className="size-5 accent-[#191A18]" />
            <Banknote aria-hidden className="size-5 text-gold-ink" />
            <span>
              <span className="font-semibold">Cash on delivery</span>
              <span className="block text-xs text-ink-secondary">Pay each store&apos;s rider when your parcel arrives.</span>
            </span>
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 className="text-[20px] font-bold leading-7">Your order</h2>
          {cart.groups.map((g) => (
            <div key={g.store.id} className="mt-4 border-t border-border pt-3">
              <p className="text-sm font-semibold">{g.store.name}</p>
              <ul className="mt-2 space-y-2">
                {g.rows.map((r) => (
                  <li key={r.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-2 text-sm">
                    <ProductImage src={r.product.image} category={r.product.category} alt="" className="rounded-control" />
                    <span className="min-w-0">
                      <span className="line-clamp-1">{r.product.title}</span>
                      <span className="tabular block text-xs text-ink-secondary">
                        Qty {r.qty}
                        {Object.values(r.options).length > 0 && ` · ${Object.values(r.options).join(" · ")}`}
                      </span>
                    </span>
                    <span className="tabular font-medium">{formatPrice(r.product.price * r.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="tabular mt-2 flex justify-between text-xs text-ink-secondary">
                <span>Delivery</span>
                <span>{g.fee === 0 ? "Free" : formatPrice(g.fee)}</span>
              </p>
            </div>
          ))}
          <p className="tabular mt-4 flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>Total to pay on delivery</span>
            <span>{formatPrice(cart.itemsTotal + cart.deliveryTotal)}</span>
          </p>
          <Button type="submit" size="lg" className="mt-4 w-full" loading={pending}>
            <Lock aria-hidden className="size-4" /> {pending ? "Placing order" : "Place order"}
          </Button>
          <p className="mt-2 text-center text-xs text-ink-secondary">
            Prices and stock are confirmed when you place the order.
          </p>
        </div>
      </aside>
    </form>
  );
}
