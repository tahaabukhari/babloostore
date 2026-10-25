"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CardProduct } from "@/lib/data";
import { ProductGrid } from "./ProductCard";
import { Button } from "./ui";

// "More to discover": Load more keeps its count in the URL (?shown=) so the
// back button restores the same position after opening a product.
export function MoreToDiscover({ products, step = 12 }: { products: CardProduct[]; step?: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = Math.min(products.length, Math.max(step, Number(params.get("shown")) || step));

  function more() {
    const next = new URLSearchParams(params.toString());
    next.set("shown", String(shown + step));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <ProductGrid products={products.slice(0, shown)} />
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="tabular text-sm text-ink-secondary" aria-live="polite">
          Showing {shown} of {products.length}
        </p>
        {shown < products.length && (
          <Button variant="secondary" onClick={more}>
            Load more
          </Button>
        )}
      </div>
    </>
  );
}
