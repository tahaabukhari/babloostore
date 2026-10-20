"use client";

import Link from "next/link";
import { Heart, Truck } from "lucide-react";
import { useState } from "react";
import { getStore, type Product } from "@/lib/data";
import { Price, ProductArt, Rating } from "./ui";

// The card is not one big link: title is the link (stretched over the image),
// wishlist is an independent sibling control so interactive elements never nest.
export function ProductCard({ product, showStore = true }: { product: Product; showStore?: boolean }) {
  const store = getStore(product.store);
  const [saved, setSaved] = useState(false);
  const soldOut = product.stock === 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-hb transition-shadow hover:shadow-card focus-within:shadow-card">
      <div className="relative">
        <ProductArt kind={product.art} tone={product.tone} className={soldOut ? "opacity-60" : ""} />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
        className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-surface/90 text-ink shadow-sm transition-hb hover:bg-surface"
      >
        <Heart aria-hidden className={`size-5 ${saved ? "fill-danger text-danger" : ""}`} />
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
          >
            {product.title}
          </Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAt} />
        <Rating value={product.rating} count={product.reviewCount} compact />
        {showStore && (
          <p className="mt-auto hidden items-center gap-1 pt-1 text-xs text-ink-secondary sm:flex">
            <Truck aria-hidden className="size-3.5" />
            <span className="truncate">
              {store.name} · {store.city}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, cols = "home" }: { products: Product[]; cols?: "home" | "filters" }) {
  const grid =
    cols === "home"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4";
  return (
    <ul className={`grid gap-3 lg:gap-5 ${grid}`}>
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}

export function ProductRow({ products, label }: { products: Product[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6"
    >
      {products.map((p) => (
        <li key={p.slug} className="w-[44%] shrink-0 sm:w-auto">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
