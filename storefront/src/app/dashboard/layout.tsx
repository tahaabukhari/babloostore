import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { requireOwner } from "@/lib/auth";
import { orderCounts } from "@/lib/owner";
import { DashboardNav } from "./DashboardNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Store dashboard", template: "%s · Store dashboard" } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, store } = await requireOwner();
  const counts = store ? await orderCounts(store.id) : null;

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="on-dark sticky top-0 z-40 bg-ink text-white">
        <div className="flex items-center gap-3 px-4 py-2 lg:px-6">
          <Logo compact />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold">{store?.name ?? "Set up your store"}</p>
            <p className="truncate text-xs text-white/70">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {store && (
              <Link
                href={`/search?store=${store.slug}`}
                className="hidden min-h-11 items-center gap-1.5 rounded-control px-3 text-sm hover:bg-white/10 sm:flex"
              >
                View store <ExternalLink aria-hidden className="size-4" />
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm hover:bg-white/10">
                <LogOut aria-hidden className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[220px_1fr]">
        <DashboardNav hasStore={!!store} newOrders={counts?.new ?? 0} />
        <main id="main" className="min-w-0 px-4 py-5 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
