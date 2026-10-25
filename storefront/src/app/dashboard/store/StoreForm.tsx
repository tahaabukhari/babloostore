"use client";

import { useActionState } from "react";
import { saveStore } from "@/app/actions/store";
import { Field, FormAlert, Select, SubmitButton, TextArea } from "@/components/form";
import type { Store } from "@/db/schema";
import { deliveryCities } from "@/lib/data";

export function StoreForm({ store }: { store: Store | null }) {
  const [state, action] = useActionState(saveStore, undefined);
  const fe = state?.fieldErrors ?? {};
  const v = (k: string, fallback?: string | number | null) => state?.values?.[k] ?? (fallback == null ? "" : String(fallback));
  const open = state?.values ? state.values.isOpen === "on" : (store?.isOpen ?? true);

  return (
    <form action={action} className="max-w-3xl space-y-5" noValidate>
      <FormAlert state={state} />
      <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
        <h2 className="text-base font-bold">Store profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Store name" defaultValue={v("name", store?.name)} error={fe.name} required />
          <Select
            name="city"
            label="City you ship from"
            defaultValue={v("city", store?.city ?? "Lahore")}
            error={fe.city}
            options={deliveryCities.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <Field name="tagline" label="Tagline" defaultValue={v("tagline", store?.tagline)} error={fe.tagline} maxLength={140} help="One line shoppers see on your store card." />
        <TextArea name="description" label="About your store" defaultValue={v("description", store?.description)} error={fe.description} rows={4} />
        <Field
          name="contactPhone"
          label="Contact phone (optional)"
          inputMode="tel"
          defaultValue={v("contactPhone", store?.contactPhone)}
          error={fe.contactPhone}
          help="Shown to customers on their order confirmation."
        />
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
        <h2 className="text-base font-bold">Delivery and returns</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="deliveryFee" label="Delivery fee (Rs.)" inputMode="numeric" defaultValue={v("deliveryFee", store?.deliveryFee ?? 200)} error={fe.deliveryFee} required />
          <Field
            name="freeDeliveryOver"
            label="Free delivery over (Rs.)"
            inputMode="numeric"
            defaultValue={v("freeDeliveryOver", store?.freeDeliveryOver)}
            error={fe.freeDeliveryOver}
            help="Leave empty for no free delivery."
          />
          <Field name="dispatchDays" label="Dispatch time" defaultValue={v("dispatchDays", store?.dispatchDays ?? "1–3 days")} error={fe.dispatchDays} required />
        </div>
        <TextArea
          name="returnPolicy"
          label="Return policy"
          defaultValue={v("returnPolicy", store?.returnPolicy)}
          error={fe.returnPolicy}
          rows={2}
          help="Shown on every product page, e.g. “7-day return for unused items with tags”."
        />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="isOpen" defaultChecked={open} className="size-5 accent-[#191A18]" />
          <span>
            <span className="font-semibold">Store is open</span>
            <span className="block text-xs text-ink-secondary">Untick to hide your store and products from shoppers temporarily.</span>
          </span>
        </label>
      </section>

      <SubmitButton size="lg" pendingLabel="Saving">
        {store ? "Save changes" : "Create store"}
      </SubmitButton>
    </form>
  );
}
