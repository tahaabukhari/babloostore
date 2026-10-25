"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { deleteProduct, saveProduct, setProductStatus } from "@/app/actions/products";
import { Field, FormAlert, Select, SubmitButton, TextArea } from "@/components/form";
import { Button } from "@/components/ui";
import type { Product } from "@/db/schema";
import { categories, optionNames } from "@/lib/data";
import { ImageManager } from "./ImageManager";

export function ProductForm({ product, uploadsEnabled }: { product?: Product; uploadsEnabled: boolean }) {
  const [state, action] = useActionState(saveProduct, undefined);
  const fe = state?.fieldErrors ?? {};
  const [category, setCategory] = useState(product?.category ?? "");
  const [pending, start] = useTransition();
  const alertRef = useRef<HTMLDivElement>(null);
  // The save buttons sit at the bottom on phones; bring any error into view.
  useEffect(() => {
    if (state?.error) alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);
  const opt = (i: number) => product?.options[i];
  const v = (k: string, fallback?: string | number | null) => state?.values?.[k] ?? (fallback == null ? "" : String(fallback));

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-5">
        <div ref={alertRef} className="scroll-mt-24">
          <FormAlert state={state} />
        </div>
        {product && <input type="hidden" name="id" value={product.id} />}

        <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 className="text-base font-bold">Details</h2>
          <Field name="title" label="Title" defaultValue={v("title", product?.title)} error={fe.title} maxLength={140} help="What it is, plus the detail shoppers search for — e.g. “Printed lawn 3-piece suit, unstitched”." />
          <Select
            name="category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={fe.category}
            options={[{ value: "", label: "Choose a category" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
          />
          <TextArea name="description" label="Description" defaultValue={v("description", product?.description)} error={fe.description} rows={6} help="Material, size/fit, care, what's in the box." />
          <TextArea name="highlights" label="Highlights (optional)" defaultValue={v("highlights", product?.highlights.join("\n"))} error={fe.highlights} rows={3} help="One per line, up to 10. Shown as bullet points." />
          <Field name="warranty" label="Warranty (optional)" defaultValue={v("warranty", product?.warranty)} error={fe.warranty} help="e.g. 6-month seller warranty. Leave empty if none." />
        </section>

        <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
          <h2 className="text-base font-bold">Price and stock</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="price" label="Price (Rs.)" inputMode="numeric" defaultValue={v("price", product?.price || "")} error={fe.price} help="Shoppers can't buy it until it has a price." />
            <Field name="compareAt" label="Compare-at (Rs.)" inputMode="numeric" defaultValue={v("compareAt", product?.compareAt)} error={fe.compareAt} help="Only if you really sold it at this price before." />
            <Field name="stock" label="Stock" inputMode="numeric" defaultValue={v("stock", product?.stock ?? 1)} error={fe.stock} />
          </div>
        </section>

        <section className="space-y-4 rounded-card border border-border bg-surface p-4 lg:p-5">
          <div>
            <h2 className="text-base font-bold">Options (optional)</h2>
            <p className="text-xs text-ink-secondary">Shoppers must pick one value from each option before adding to cart. Stock is shared across options for now.</p>
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <Select
                name={`option${i + 1}Name`}
                label={`Option ${i + 1}`}
                defaultValue={v(`option${i + 1}Name`, opt(i)?.name)}
                options={[{ value: "", label: "None" }, ...optionNames.map((n) => ({ value: n, label: n }))]}
              />
              <Field name={`option${i + 1}Values`} label="Values, separated by commas" defaultValue={v(`option${i + 1}Values`, opt(i)?.values.join(", "))} placeholder="S, M, L, XL" />
            </div>
          ))}
          {fe.options && (
            <p role="alert" className="text-sm text-danger">
              {fe.options}
            </p>
          )}
        </section>

        <section className="rounded-card border border-border bg-surface p-4 lg:p-5">
          <ImageManager initial={product?.images ?? []} category={category} error={fe.images} uploadsEnabled={uploadsEnabled} />
        </section>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-[84px] lg:self-start">
        <div className="space-y-3 rounded-card border border-border bg-surface p-4">
          <p className="text-sm">
            Status:{" "}
            <strong>{product ? { active: "Live", draft: "Draft", archived: "Archived" }[product.status] : "New"}</strong>
          </p>
          <SubmitButton name="intent" value="active" className="w-full" size="lg" pendingLabel="Saving">
            {product?.status === "active" ? "Save changes" : "Save and publish"}
          </SubmitButton>
          <SubmitButton name="intent" value="draft" variant="secondary" className="w-full">
            {product?.status === "active" ? "Unpublish (save as draft)" : "Save as draft"}
          </SubmitButton>
        </div>
        {product && (
          <div className="space-y-2 rounded-card border border-border bg-surface p-4">
            {product.status !== "archived" ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={pending}
                onClick={() => start(() => setProductStatus(product.id, "archived"))}
              >
                Archive (hide from store)
              </Button>
            ) : (
              <p className="text-xs text-ink-secondary">Archived products are hidden. Save as draft or publish to bring it back.</p>
            )}
            <Button
              type="button"
              variant="danger"
              className="w-full"
              disabled={pending}
              onClick={() => {
                if (confirm("Delete this product permanently? Past orders keep their own copy of the details.")) start(() => deleteProduct(product.id));
              }}
            >
              Delete product
            </Button>
          </div>
        )}
      </aside>
    </form>
  );
}
