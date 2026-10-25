import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { StoreForm } from "./StoreForm";

export const metadata: Metadata = { title: "Store settings" };

export default async function StoreSettingsPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { store } = await requireOwner("/dashboard/store");
  const { welcome } = await searchParams;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-bold leading-[34px]">{store ? "Store settings" : "Set up your store"}</h1>
        {(welcome || !store) && (
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            {welcome ? "Welcome! Your store is created. " : ""}Check your delivery fee, dispatch time and return policy — shoppers see
            these on every product. Then add your first product.
          </p>
        )}
      </div>
      <StoreForm store={store} />
    </div>
  );
}
