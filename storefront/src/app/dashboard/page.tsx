import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StatusLabel, buttonClass } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { formatPrice } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { listOrders, lowStock, orderCounts, productCounts, salesSummary } from "@/lib/owner";

export default async function DashboardHome() {
  const { user, store } = await requireOwner();
  if (!store) redirect("/dashboard/store?setup=1");

  const [counts, sales, recent, low, pc] = await Promise.all([
    orderCounts(store.id),
    salesSummary(store.id, 30),
    listOrders(store.id, undefined, 6),
    lowStock(store.id),
    productCounts(store.id),
  ]);

  const stats = [
    { label: "New orders", value: String(counts.new ?? 0), note: "Waiting for you to confirm", href: "/dashboard/orders?status=new" },
    { label: "To ship", value: String(counts.confirmed ?? 0), note: "Confirmed, not yet shipped", href: "/dashboard/orders?status=confirmed" },
    { label: "Orders · 30 days", value: String(sales.orders), note: "Excluding cancelled" },
    { label: "Order value · 30 days", value: formatPrice(sales.value), note: "Cash on delivery — not yet collected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-[34px]">Hello, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-ink-secondary">Here&apos;s what&apos;s happening at {store.name}.</p>
        </div>
        <AutoRefresh />
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-xs font-medium text-ink-secondary">{s.label}</p>
              <p className="tabular mt-1 font-heading text-[24px] font-extrabold leading-8">{s.value}</p>
              <p className="mt-1 text-xs text-ink-secondary">{s.note}</p>
            </>
          );
          return (
            <li key={s.label}>
              {s.href ? (
                <Link href={s.href} className="block h-full rounded-card border border-border bg-surface p-4 transition-hb hover:shadow-card">
                  {body}
                </Link>
              ) : (
                <div className="h-full rounded-card border border-border bg-surface p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {!pc.active && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold bg-gold-soft p-4">
          <p className="text-sm">
            <strong>Your store has no live products yet.</strong> Shoppers will see your store once you publish one.
          </p>
          <Link href="/dashboard/products/new" className={buttonClass("primary")}>
            <Plus aria-hidden className="size-4" /> Add a product
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="recent" className="rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id="recent" className="text-base font-bold">
              Recent orders
            </h2>
            <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-semibold text-gold-ink hover:underline">
              All orders <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-border">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-muted">
                    <span className="tabular w-28 font-semibold">{o.orderNo}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {o.customerName} · {o.city}
                    </span>
                    <span className="tabular text-sm font-semibold">{formatPrice(o.total)}</span>
                    <StatusLabel status={o.status} />
                    <span className="w-24 text-right text-xs text-ink-secondary">{timeAgo(o.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-ink-secondary">No orders yet. New orders appear here automatically.</p>
          )}
        </section>

        <section aria-labelledby="low" className="rounded-card border border-border bg-surface">
          <h2 id="low" className="border-b border-border px-4 py-3 text-base font-bold">
            Low stock
          </h2>
          {low.length ? (
            <ul className="divide-y divide-border">
              {low.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-muted">
                    {p.stock === 0 && <AlertTriangle aria-hidden className="size-4 text-danger" />}
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <span className={`tabular font-semibold ${p.stock === 0 ? "text-danger" : "text-gold-ink"}`}>
                      {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-ink-secondary">Every live product has more than 3 in stock.</p>
          )}
        </section>
      </div>
    </div>
  );
}
