import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { StatusLabel, buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { listUserOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("/account");
  const { denied } = await searchParams;
  const orders = await listUserOrders(user.id);
  const isOwner = user.role !== "customer";

  return (
    <div className="container-hb max-w-3xl space-y-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-[34px]">Hello, {user.name}</h1>
          <p className="text-sm text-ink-secondary">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className={buttonClass("secondary")}>
            <LogOut aria-hidden className="size-4" /> Sign out
          </button>
        </form>
      </div>

      {denied && !isOwner && (
        <p role="alert" className="rounded-card border border-gold bg-gold-soft p-3 text-sm">
          The store dashboard is only for store owner accounts. BablooStore sets these up — contact us if you&apos;d like to sell.
        </p>
      )}

      {isOwner && (
        <Link href="/dashboard" className="flex items-center gap-3 rounded-card border border-gold bg-gold-soft p-4 font-semibold hover:shadow-card">
          <LayoutDashboard aria-hidden className="size-5" /> Go to your store dashboard
        </Link>
      )}

      <section aria-labelledby="orders" className="rounded-card border border-border bg-surface">
        <h2 id="orders" className="border-b border-border px-4 py-3 text-base font-bold">
          Your orders
        </h2>
        {orders.length ? (
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/order/${o.checkoutId}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-canvas">
                  <span className="tabular font-semibold">{o.orderNo}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-secondary">
                    {o.storeName} · {formatDateTime(o.createdAt)}
                  </span>
                  <span className="tabular text-sm font-semibold">{formatPrice(o.total)}</span>
                  <StatusLabel status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-ink-secondary">
            No orders yet. Orders you place while signed in show up here.
          </p>
        )}
      </section>
    </div>
  );
}
