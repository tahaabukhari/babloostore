import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireOwnerStore } from "@/lib/auth";
import { getOwnerProduct } from "@/lib/owner";
import { ProductForm } from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { store } = await requireOwnerStore(`/dashboard/products/${id}`);
  const product = await getOwnerProduct(store.id, id);
  if (!product) notFound();
  return (
    <div className="space-y-4">
      <Link href="/dashboard/products" className="inline-flex min-h-9 items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> Products
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="line-clamp-2 text-[26px] font-bold leading-[34px]">{product.title}</h1>
        {product.status === "active" && (
          <Link href={`/product/${product.slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-gold-ink hover:underline">
            View in shop <ExternalLink aria-hidden className="size-4" />
          </Link>
        )}
      </div>
      <ProductForm key={product.updatedAt.toISOString()} product={product} />
    </div>
  );
}
