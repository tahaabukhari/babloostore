"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { ProductGrid } from "./ProductCard";
import { Button } from "./ui";

// Campaign countdown — only rendered for campaigns with a real end time.
export function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(endsAt);
  const label = end.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  if (now === null) return <span className="tabular text-sm">Ends {label}</span>;
  const ms = end.getTime() - now;
  if (ms <= 0) return <span className="text-sm font-semibold">Campaign ended</span>;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return (
    <span className="tabular text-sm">
      <span className="font-semibold">
        Ends in {d > 0 ? `${d}d ` : ""}
        {h}h {m}m
      </span>{" "}
      <span className="text-ink-secondary">({label} PKT)</span>
    </span>
  );
}

// "More to discover": Load more keeps its count in the URL (?shown=) so the
// back button restores the same position after opening a product.
export function MoreToDiscover({ products, step = 6 }: { products: Product[]; step?: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = Math.min(products.length, Math.max(step, Number(params.get("shown")) || step));
  const [loading, setLoading] = useState(false);

  function more() {
    setLoading(true);
    // Simulated latency so the loading state can be reviewed.
    setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.set("shown", String(shown + step));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      setLoading(false);
    }, 450);
  }

  return (
    <>
      <ProductGrid products={products.slice(0, shown)} />
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="tabular text-sm text-ink-secondary" aria-live="polite">
          Showing {shown} of {products.length}
        </p>
        {shown < products.length && (
          <Button variant="secondary" onClick={more} loading={loading}>
            {loading ? "Loading" : "Load more"}
          </Button>
        )}
      </div>
    </>
  );
}
