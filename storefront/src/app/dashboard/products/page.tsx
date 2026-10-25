import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductImage, buttonClass } from "@/components/ui";
import { requireOwnerStore } from "@/lib/auth";
import { formatPrice, getCategory } from "@/lib/data";
import { listOwnerProducts } from "@/lib/owner";

export const metadata: Metadata = { title: "Products" };

const statusStyle = {
  active: "bg-green-soft text-green",
  draft: "bg-surface-muted text-ink-secondary",
  archived: "bg-danger-soft text-danger",
} as const;
const statusText = { active: "Live", draft: "Draft", archived: "Archived" } as const;
// Products save with whatever was filled in; remind the owner what's left.
function missingInfo(p: { price: number; category: string; images: string[]; stock: number; description: string }) {
  const out: string[] = [];
  if (p.price <= 0) out.push("price");
  if (!getCategory(p.category)) out.push("category");
  if (!p.images.length) out.push("photos");
  if (!p.description) out.push("description");
  if (p.stock <= 0) out.push("stock");
  return out;
}

const savedText: Record<string, string> = {
  published: "Product saved and live in your store.",
  draft: "Product saved as a draft — only you can see it.",
  deleted: "Product deleted.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { store } = await requireOwnerStore("/dashboard/products");
  const { saved } = await searchParams;
  const items = await listOwnerProducts(store.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold leading-[34px]">Products</h1>
        <Link href="/dashboard/products/new" className={buttonClass("primary")}>
          <Plus aria-hidden className="size-4" /> New product
        </Link>
      </div>
      {saved && savedText[saved] && (
        <p role="status" className="rounded-card border border-green/30 bg-green-soft p-3 text-sm text-green">
          {savedText[saved]}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-control bg-surface p-10 text-center">
          <h2 className="text-[20px] font-bold leading-7">Add your first product</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-secondary">
            Give it a clear title, price, stock and a few photo links. Save it as a draft until you&apos;re ready to publish.
          </p>
          <Link href="/dashboard/products/new" className={buttonClass("primary", "lg", "mt-5")}>
            <Plus aria-hidden className="size-4" /> New product
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/dashboard/products/${p.id}`} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 p-3 hover:bg-canvas sm:grid-cols-[56px_1fr_100px_90px_80px] sm:gap-4">
                <ProductImage src={p.images[0]} category={p.category} alt="" className="rounded-control" />
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-medium">{p.title}</span>
                  <span className="block text-xs text-ink-secondary">{getCategory(p.category)?.name ?? "No category"}</span>
                  {missingInfo(p).length > 0 && (
                    <span className="mt-1 block text-xs font-medium text-gold-ink">Needs: {missingInfo(p).join(", ")}</span>
                  )}
                </span>
                <span className="tabular hidden text-right text-sm font-semibold sm:block">{formatPrice(p.price)}</span>
                <span className={`tabular hidden text-right text-sm sm:block ${p.stock === 0 ? "font-semibold text-danger" : ""}`}>
                  {p.stock} in stock
                </span>
                <span className={`justify-self-end rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[p.status]}`}>
                  {statusText[p.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
