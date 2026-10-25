import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StatusLabel, statusMap, type OrderStatus } from "@/components/ui";
import { requireOwnerStore } from "@/lib/auth";
import { formatPrice } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { listOrders, orderCounts } from "@/lib/owner";

export const metadata: Metadata = { title: "Orders" };

const tabs: (OrderStatus | "all")[] = ["all", "new", "confirmed", "shipped", "delivered", "cancelled"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { store } = await requireOwnerStore("/dashboard/orders");
  const sp = await searchParams;
  const status = tabs.includes(sp.status as OrderStatus) && sp.status !== "all" ? (sp.status as OrderStatus) : undefined;
  const [orders, counts] = await Promise.all([listOrders(store.id, status), orderCounts(store.id)]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[26px] font-bold leading-[34px]">Orders</h1>
        <AutoRefresh />
      </div>

      <nav aria-label="Filter by status">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = (status ?? "all") === t;
            const n = t === "all" ? counts.all : (counts[t] ?? 0);
            return (
              <li key={t} className="shrink-0">
                <Link
                  href={t === "all" ? "/dashboard/orders" : `/dashboard/orders?status=${t}`}
                  aria-current={active ? "page" : undefined}
                  className={`tabular flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
                    active ? "border-ink bg-gold-soft" : "border-control bg-surface hover:bg-surface-muted"
                  }`}
                >
                  {t === "all" ? "All" : statusMap[t].label}
                  <span className="text-xs text-ink-secondary">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-control bg-surface p-8 text-center text-sm text-ink-secondary">
          {status ? `No ${statusMap[status].label.toLowerCase()} orders.` : "No orders yet. They appear here automatically when shoppers check out."}
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-card border border-border bg-surface md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Orders</caption>
              <thead className="bg-surface-muted text-left text-xs text-ink-secondary">
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold">Order</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Placed</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Customer</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Items</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Total</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/orders/${o.id}`} className="tabular font-semibold text-info underline-offset-2 hover:underline">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      {o.customerName}
                      <span className="block text-xs text-ink-secondary">{o.city}</span>
                    </td>
                    <td className="tabular px-4 py-3 text-right">{o.items}</td>
                    <td className="tabular px-4 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <StatusLabel status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/dashboard/orders/${o.id}`} className="block rounded-card border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="tabular font-semibold">{o.orderNo}</span>
                    <StatusLabel status={o.status} />
                  </div>
                  <p className="mt-1 text-sm">
                    {o.customerName} · {o.city}
                  </p>
                  <p className="tabular mt-1 flex justify-between text-sm text-ink-secondary">
                    <span>
                      {formatDateTime(o.createdAt)} · {o.items} item{o.items === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold text-ink">{formatPrice(o.total)}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
