"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, Home, LayoutGrid, MapPin, Menu, ShoppingCart, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { categories, deliveryCities } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";

function CartLink({ withLabel = false }: { withLabel?: boolean }) {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${ready ? count : 0} items`}
      className="relative flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-2 text-white hover:bg-white/10"
    >
      <ShoppingCart aria-hidden className="size-6" />
      {withLabel && <span className="text-sm font-semibold">Cart</span>}
      {ready && count > 0 && (
        <span
          aria-hidden
          className="tabular absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold leading-5 text-ink"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function DeliveryPicker() {
  const [city, setCity] = useState("Lahore");
  return (
    <label className="hidden min-h-11 items-center gap-1.5 rounded-control px-2 text-white hover:bg-white/10 lg:flex">
      <MapPin aria-hidden className="size-5 text-gold" />
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] text-white/70">Deliver to</span>
        <span className="relative flex items-center text-sm font-semibold">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Delivery city"
            className="cursor-pointer appearance-none bg-transparent pr-5 font-semibold text-white outline-none [&>option]:text-ink"
          >
            {deliveryCities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-0 size-4" />
        </span>
      </span>
    </label>
  );
}

function CategoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-ink/50"
        style={{ animation: "hb-fade-in var(--hb-motion-panel)" }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shop by category"
        className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col bg-surface shadow-overlay"
        style={{ animation: "hb-drawer-in var(--hb-motion-panel) ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold">Shop by category</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            className="grid size-11 place-items-center rounded-control hover:bg-surface-muted"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <nav aria-label="Categories" className="flex-1 overflow-y-auto">
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/search?category=${c.slug}`}
                  onClick={onClose}
                  className="flex min-h-14 items-center justify-between border-b border-border px-4 hover:bg-surface-muted"
                >
                  <span>
                    <span className="block font-semibold">{c.name}</span>
                    <span className="block text-xs text-ink-secondary">{c.blurb}</span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 text-ink-secondary" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function Header() {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 1. Utility row */}
      <div className="hidden bg-surface-muted text-xs text-ink-secondary sm:block">
        <div className="container-hb flex h-8 items-center justify-between">
          <p>Cash on delivery · Each store ships its own items</p>
        </div>
      </div>

      {/* 2. Charcoal header */}
      <header className="on-dark sticky top-0 z-40 bg-ink text-white">
        <div className="container-hb flex items-center gap-2 py-2 lg:gap-4 lg:py-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open categories"
            aria-expanded={drawer}
            className="grid size-11 place-items-center rounded-control hover:bg-white/10 lg:hidden"
          >
            <Menu aria-hidden className="size-6" />
          </button>
          <Logo />
          <DeliveryPicker />
          <div className="mx-2 hidden flex-1 sm:block">
            <Suspense>
              <SearchBox id="search-desktop" />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <a
              href="#"
              aria-label="Wishlist"
              className="hidden size-11 place-items-center rounded-control hover:bg-white/10 sm:grid"
            >
              <Heart aria-hidden className="size-6" />
            </a>
            <CartLink withLabel />
          </div>
        </div>
        <div className="container-hb pb-2 sm:hidden">
          <Suspense>
            <SearchBox id="search-mobile" />
          </Suspense>
        </div>
      </header>

      {/* 3. Category nav (desktop/tablet) */}
      <nav aria-label="Categories" className="hidden border-b border-border bg-surface sm:block">
        <ul className="container-hb flex h-11 items-center gap-1 overflow-x-auto text-sm">
          <li className="lg:hidden">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex min-h-10 items-center gap-1.5 rounded-control px-3 font-semibold hover:bg-surface-muted"
            >
              <LayoutGrid aria-hidden className="size-4" /> All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/search?category=${c.slug}`}
                className="flex min-h-10 items-center whitespace-nowrap rounded-control px-3 font-medium hover:bg-surface-muted"
              >
                {c.short}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/search"
              className="flex min-h-10 items-center whitespace-nowrap rounded-control px-3 font-medium hover:bg-surface-muted"
            >
              More
            </Link>
          </li>
        </ul>
      </nav>

      <CategoryDrawer open={drawer} onClose={() => setDrawer(false)} />
      <MobileBottomNav pathname={pathname} onCategories={() => setDrawer(true)} />
    </>
  );
}

function MobileBottomNav({
  pathname,
  onCategories,
}: {
  pathname: string;
  onCategories: () => void;
}) {
  const { count, ready } = useCart();
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium";
  const on = (p: string) => (pathname === p ? "text-gold-ink" : "text-ink-secondary");
  // Product detail has its own sticky purchase bar in this slot.
  if (pathname.startsWith("/product/")) return null;
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <Link href="/" className={`${item} ${on("/")}`} aria-current={pathname === "/" ? "page" : undefined}>
        <Home aria-hidden className="size-5" /> Home
      </Link>
      <button type="button" onClick={onCategories} className={`${item} text-ink-secondary`}>
        <LayoutGrid aria-hidden className="size-5" /> Categories
      </button>
      <Link href="/cart" className={`${item} ${on("/cart")} relative`} aria-current={pathname === "/cart" ? "page" : undefined}>
        <ShoppingCart aria-hidden className="size-5" />
        Cart{ready && count > 0 ? ` (${count})` : ""}
      </Link>
    </nav>
  );
}
