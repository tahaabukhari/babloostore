"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";

export function DashboardNav({ hasStore, newOrders }: { hasStore: boolean; newOrders: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Overview", Icon: LayoutDashboard, exact: true },
    { href: "/dashboard/orders", label: "Orders", Icon: ShoppingBag, badge: newOrders },
    { href: "/dashboard/products", label: "Products", Icon: Package },
    { href: "/dashboard/store", label: hasStore ? "Store settings" : "Set up store", Icon: Store },
  ];
  return (
    <nav
      aria-label="Dashboard"
      className="sticky top-[60px] z-30 border-b border-border bg-surface lg:top-[60px] lg:h-[calc(100dvh-60px)] lg:border-b-0 lg:border-r"
    >
      <ul className="flex overflow-x-auto px-2 lg:flex-col lg:gap-1 lg:p-3">
        {items.map(({ href, label, Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-control px-3 text-sm font-medium ${
                  active ? "bg-gold-soft text-ink" : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <Icon aria-hidden className="size-4" />
                {label}
                {!!badge && (
                  <span className="tabular ml-auto rounded-full bg-gold px-1.5 text-xs font-bold text-ink">
                    {badge}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
