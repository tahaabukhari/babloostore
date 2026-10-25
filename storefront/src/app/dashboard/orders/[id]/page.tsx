import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { ProductImage, StatusLabel } from "@/components/ui";
import { requireOwnerStore } from "@/lib/auth";
import { formatPrice } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { nextStatuses } from "@/lib/orderFlow";
import { getOwnerOrder } from "@/lib/owner";
import { StatusControls } from "./StatusControls";

export default async function OwnerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { store } = await requireOwnerStore(`/dashboard/orders/${id}`);
  const data = await getOwnerOrder(store.id, id);
  if (!data) notFound();
  const { order, items } = data;

  return (
    <div className="space-y-5">
      <Link href="/dashboard/orders" className="inline-flex min-h-9 items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="tabular text-[26px] font-bold leading-[34px]">{order.orderNo}</h1>
        <StatusLabel status={order.status} />
        <span className="text-sm text-ink-secondary">Placed {formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section aria-labelledby="items" className="rounded-card border border-border bg-surface">
            <h2 id="items" className="border-b border-border px-4 py-3 text-base font-bold">
              Items to pack
            </h2>
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3">
                  <ProductImage src={it.imageUrl} category="" alt="" className="rounded-control" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{it.title}</p>
                    {Object.keys(it.options).length > 0 && (
                      <p className="text-xs text-ink-secondary">
                        {Object.entries(it.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="tabular text-xs text-ink-secondary">
                      {it.qty} × {formatPrice(it.unitPrice)}
                    </p>
                  </div>
                  <p className="tabular text-sm font-semibold">{formatPrice(it.qty * it.unitPrice)}</p>
                </li>
              ))}
            </ul>
            <dl className="tabular space-y-1 border-t border-border px-4 py-3 text-sm">
              <div className="flex justify-between">
                <dt>Items</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt>Collect on delivery</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="actions" className="rounded-card border border-border bg-surface p-4">
            <h2 id="actions" className="mb-3 text-base font-bold">
              Update status
            </h2>
            <StatusControls orderId={order.id} next={nextStatuses[order.status]} />
          </section>
        </div>

        <aside aria-labelledby="customer" className="h-fit rounded-card border border-border bg-surface p-4 text-sm">
          <h2 id="customer" className="mb-3 text-base font-bold">
            Customer
          </h2>
          <p className="font-semibold">{order.customerName}</p>
          <ul className="mt-3 space-y-3">
            <li className="flex gap-2">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="tabular text-info underline underline-offset-2">
                {order.phone}
              </a>
            </li>
            {order.email && (
              <li className="flex gap-2">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <a href={`mailto:${order.email}`} className="break-all text-info underline underline-offset-2">
                  {order.email}
                </a>
              </li>
            )}
            <li className="flex gap-2">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
              <span className="whitespace-pre-line">
                {order.address}
                {"\n"}
                {order.city}
              </span>
            </li>
            {order.notes && (
              <li className="flex gap-2">
                <StickyNote aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                <span className="whitespace-pre-line">{order.notes}</span>
              </li>
            )}
          </ul>
          <p className="mt-4 rounded-control bg-surface-muted p-3 text-xs text-ink-secondary">
            Payment: cash on delivery. Use these details only to fulfil this order.
          </p>
        </aside>
      </div>
    </div>
  );
}
