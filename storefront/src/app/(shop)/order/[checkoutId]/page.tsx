import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import { ProductImage, StatusLabel, buttonClass } from "@/components/ui";
import { formatPrice } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { getCheckout } from "@/lib/orders";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ checkoutId: string }> }) {
  const { checkoutId } = await params;
  const groups = await getCheckout(checkoutId);
  if (!groups) notFound();
  const first = groups[0].order;
  const total = groups.reduce((n, g) => n + g.order.total, 0);

  return (
    <div className="container-hb max-w-3xl py-6 lg:py-10">
      <div className="rounded-card border border-green/30 bg-green-soft p-5">
        <p className="flex items-center gap-2 text-[20px] font-bold leading-7 text-green">
          <CheckCircle2 aria-hidden className="size-6" /> Order placed
        </p>
        <p className="mt-1 text-sm">
          Thanks, {first.customerName.split(" ")[0]}. {groups.length > 1 ? `Your items come from ${groups.length} stores, so they arrive in ${groups.length} separate parcels.` : "The store will call you on"}{" "}
          {groups.length === 1 && <strong className="tabular">{first.phone}</strong>}
          {groups.length === 1 ? " to confirm before dispatch." : " Each store will call you to confirm."}
        </p>
        <p className="mt-2 text-xs text-ink-secondary">
          Placed {formatDateTime(first.createdAt)} · Bookmark this page to check your order status.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {groups.map(({ order, storeName, storeSlug, storePhone, dispatchDays, items }) => (
          <section key={order.id} aria-labelledby={`o-${order.id}`} className="rounded-card border border-border bg-surface">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3">
              <h2 id={`o-${order.id}`} className="tabular font-heading text-base font-bold">
                {order.orderNo}
              </h2>
              <StatusLabel status={order.status} />
              <span className="text-sm text-ink-secondary sm:ml-auto">
                from{" "}
                <Link href={`/search?store=${storeSlug}`} className="font-semibold text-ink hover:underline">
                  {storeName}
                </Link>{" "}
                · dispatches in {dispatchDays}
              </span>
            </header>
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 px-4 py-3 text-sm">
                  <ProductImage src={it.imageUrl} category="" alt="" className="rounded-control" />
                  <span className="min-w-0">
                    <span className="line-clamp-1">{it.title}</span>
                    <span className="tabular block text-xs text-ink-secondary">
                      {it.qty} × {formatPrice(it.unitPrice)}
                      {Object.values(it.options).length > 0 && ` · ${Object.values(it.options).join(" · ")}`}
                    </span>
                  </span>
                  <span className="tabular font-medium">{formatPrice(it.qty * it.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <footer className="tabular flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
              <span className="text-ink-secondary">
                Delivery {order.deliveryFee ? formatPrice(order.deliveryFee) : "free"}
                {storePhone && (
                  <>
                    {" · "}
                    <a href={`tel:${storePhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-info underline">
                      <Phone aria-hidden className="size-3.5" /> {storePhone}
                    </a>
                  </>
                )}
              </span>
              <span>
                Pay on delivery <strong>{formatPrice(order.total)}</strong>
              </span>
            </footer>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
        <p className="tabular text-base font-bold">Total cash on delivery: {formatPrice(total)}</p>
        <Link href="/" className={buttonClass("secondary")}>
          Continue shopping
        </Link>
      </div>
      <p className="mt-3 text-xs text-ink-secondary">
        Delivering to {first.address}, {first.city}.
      </p>
    </div>
  );
}
