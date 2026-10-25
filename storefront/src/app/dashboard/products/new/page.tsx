import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireOwnerStore } from "@/lib/auth";
import { isStorageConfigured } from "@/lib/storage";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  await requireOwnerStore("/dashboard/products/new");
  const { welcome } = await searchParams;
  return (
    <div className="space-y-4">
      <Link href="/dashboard/products" className="inline-flex min-h-9 items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> Products
      </Link>
      <h1 className="text-[26px] font-bold leading-[34px]">New product</h1>
      {welcome && (
        <p role="status" className="rounded-card border border-green/30 bg-green-soft p-3 text-sm text-green">
          Your store is set up. Add your first product — it appears in the shop as soon as you publish it.
        </p>
      )}
      <ProductForm uploadsEnabled={isStorageConfigured()} />
    </div>
  );
}
