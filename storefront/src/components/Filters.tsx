"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { categories, getCategory, type SearchParams } from "@/lib/data";

export type StoreOption = { slug: string; name: string; city: string };
import { Button } from "./ui";

type Draft = Pick<SearchParams, "category" | "store" | "min" | "max" | "instock">;
const FILTER_KEYS = ["category", "store", "min", "max", "instock"] as const;

function useFilterUrl() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current: Draft = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? undefined]));

  function apply(next: Draft) {
    const sp = new URLSearchParams(params.toString());
    for (const k of FILTER_KEYS) {
      const v = next[k];
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("shown");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }
  return { params, current, apply };
}

function FilterFields({
  value,
  onChange,
  idPrefix,
  stores,
}: {
  value: Draft;
  onChange: (d: Draft) => void;
  idPrefix: string;
  stores: StoreOption[];
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...value, ...patch });
  const radio = "size-5 accent-[#191A18]";
  const row = "flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-2 text-sm hover:bg-surface-muted";
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Category</legend>
        <label className={row}>
          <input type="radio" className={radio} name={`${idPrefix}-cat`} checked={!value.category} onChange={() => set({ category: undefined })} />
          All categories
        </label>
        {categories.map((c) => (
          <label key={c.slug} className={row}>
            <input
              type="radio"
              className={radio}
              name={`${idPrefix}-cat`}
              checked={value.category === c.slug}
              onChange={() => set({ category: c.slug })}
            />
            {c.name}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold">Price (Rs.)</legend>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${idPrefix}-min`} className="mb-1 block text-xs text-ink-secondary">
              Minimum
            </label>
            <input
              id={`${idPrefix}-min`}
              inputMode="numeric"
              value={value.min ?? ""}
              onChange={(e) => set({ min: e.target.value.replace(/\D/g, "") || undefined })}
              className="tabular h-11 w-full rounded-control border border-control bg-surface px-3 text-[16px]"
            />
          </div>
          <span aria-hidden className="pb-2.5 text-ink-secondary">
            –
          </span>
          <div className="flex-1">
            <label htmlFor={`${idPrefix}-max`} className="mb-1 block text-xs text-ink-secondary">
              Maximum
            </label>
            <input
              id={`${idPrefix}-max`}
              inputMode="numeric"
              value={value.max ?? ""}
              onChange={(e) => set({ max: e.target.value.replace(/\D/g, "") || undefined })}
              className="tabular h-11 w-full rounded-control border border-control bg-surface px-3 text-[16px]"
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1500, 3000, 5000, 10000].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={value.max === String(m) && !value.min}
              onClick={() => set({ min: undefined, max: String(m) })}
              className="tabular min-h-9 rounded-full border border-control px-3 text-xs font-medium hover:bg-surface-muted aria-pressed:border-ink aria-pressed:bg-gold-soft"
            >
              Under {m.toLocaleString("en-PK")}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-bold">Store</legend>
        <label className={row}>
          <input type="radio" className={radio} name={`${idPrefix}-store`} checked={!value.store} onChange={() => set({ store: undefined })} />
          All stores
        </label>
        {stores.map((s) => (
          <label key={s.slug} className={row}>
            <input
              type="radio"
              className={radio}
              name={`${idPrefix}-store`}
              checked={value.store === s.slug}
              onChange={() => set({ store: s.slug })}
            />
            <span>
              {s.name} <span className="text-xs text-ink-secondary">· {s.city}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="sr-only">Availability</legend>
        <label className={row}>
          <input
            type="checkbox"
            className="size-5 accent-[#191A18]"
            checked={value.instock === "1"}
            onChange={(e) => set({ instock: e.target.checked ? "1" : undefined })}
          />
          Hide out-of-stock items
        </label>
      </fieldset>
    </div>
  );
}

// Desktop: changes apply immediately and update the URL.
export function FilterSidebar({ stores }: { stores: StoreOption[] }) {
  const { current, apply } = useFilterUrl();
  return (
    <aside aria-labelledby="filters-heading" className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-card border border-border bg-surface p-4">
        <h2 id="filters-heading" className="mb-4 text-base font-bold">
          Filters
        </h2>
        <FilterFields value={current} onChange={apply} idPrefix="side" stores={stores} />
      </div>
    </aside>
  );
}

// Mobile: full-width bottom sheet; changes are applied explicitly, focus returns to the trigger.
export function MobileFilterButton({ stores }: { stores: StoreOption[] }) {
  const { current, apply } = useFilterUrl();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(current);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const activeCount = FILTER_KEYS.filter((k) => current[k]).length;

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setDraft(current);
          setOpen(true);
        }}
        className="flex min-h-11 items-center gap-2 rounded-control border border-control bg-surface px-3 text-sm font-semibold lg:hidden"
      >
        <SlidersHorizontal aria-hidden className="size-4" />
        Filters{activeCount > 0 && <span className="tabular rounded-full bg-ink px-1.5 text-xs text-white">{activeCount}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div aria-hidden className="absolute inset-0 bg-ink/50" onClick={close} style={{ animation: "hb-fade-in var(--hb-motion-panel)" }} />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[20px] bg-surface shadow-overlay"
            style={{ animation: "hb-sheet-in var(--hb-motion-panel) ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 id="sheet-title" className="text-lg font-bold">
                Filters
              </h2>
              <button type="button" onClick={close} aria-label="Close filters" className="grid size-11 place-items-center rounded-control hover:bg-surface-muted">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterFields value={draft} onChange={setDraft} idPrefix="sheet" stores={stores} />
            </div>
            <div className="flex gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="secondary" className="flex-1" onClick={() => setDraft({})}>
                Reset
              </Button>
              <Button
                className="flex-[2]"
                onClick={() => {
                  apply(draft);
                  close();
                }}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SelectedChips({ stores }: { stores: StoreOption[] }) {
  const { current, apply } = useFilterUrl();
  const chips: { key: keyof Draft; label: string }[] = [];
  if (current.category) chips.push({ key: "category", label: getCategory(current.category)?.name ?? current.category });
  if (current.store) chips.push({ key: "store", label: stores.find((s) => s.slug === current.store)?.name ?? current.store });
  if (current.min) chips.push({ key: "min", label: `From Rs. ${Number(current.min).toLocaleString("en-PK")}` });
  if (current.max) chips.push({ key: "max", label: `Up to Rs. ${Number(current.max).toLocaleString("en-PK")}` });
  if (current.instock) chips.push({ key: "instock", label: "In stock only" });
  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.key}>
          <button
            type="button"
            onClick={() => apply({ ...current, [c.key]: undefined })}
            className="tabular flex min-h-9 items-center gap-1.5 rounded-full border border-ink bg-gold-soft pl-3 pr-2 text-xs font-semibold"
          >
            {c.label}
            <X aria-hidden className="size-3.5" />
            <span className="sr-only">Remove filter</span>
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={() => apply({})} className="min-h-9 px-2 text-xs font-semibold text-gold-ink hover:underline">
          Reset all
        </button>
      </li>
    </ul>
  );
}

export function SortSelect() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="hidden text-sm text-ink-secondary sm:block">
        Sort by
      </label>
      <select
        id="sort"
        value={params.get("sort") ?? "relevance"}
        onChange={(e) => {
          const sp = new URLSearchParams(params.toString());
          if (e.target.value === "relevance") sp.delete("sort");
          else sp.set("sort", e.target.value);
          router.push(`${pathname}?${sp.toString()}`, { scroll: false });
        }}
        className="min-h-11 rounded-control border border-control bg-surface px-3 text-sm font-medium"
        aria-label="Sort results"
      >
        <option value="relevance">Best match</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
