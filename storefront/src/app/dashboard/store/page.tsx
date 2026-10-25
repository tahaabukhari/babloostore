import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { StoreForm } from "./StoreForm";

export const metadata: Metadata = { title: "Store settings" };

export default async function StoreSettingsPage() {
  const { store } = await requireOwner("/dashboard/store");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-bold leading-[34px]">{store ? "Store settings" : "Set up your store"}</h1>
        {!store && (
          <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
            Tell shoppers who you are and how you deliver. You can change all of this later.
          </p>
        )}
      </div>
      <StoreForm store={store} />
    </div>
  );
}
