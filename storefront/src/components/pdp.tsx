"use client";

import { Check, Minus, Plus, ShoppingCart, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, type Product, type ProductOption } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useToast } from "./Toast";
import { Button, ProductArt, StockLine } from "./ui";

/* ---------- Gallery ---------- */

const views = ["Front", "Angle", "Detail", "Side"];

export function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const zoomBtn = useRef<HTMLButtonElement>(null);
  const alt = (i: number) => `${product.title}, ${views[i].toLowerCase()} view`;

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") setIndex((i) => (i + 1) % views.length);
    if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + views.length) % views.length);
  }

  useEffect(() => {
    if (!zoom) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoom(false);
        zoomBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [zoom]);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      <div role="tablist" aria-label="Product images" onKeyDown={onKey} className="flex gap-2 lg:flex-col">
        {views.map((v, i) => (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={i === index}
            aria-label={`Show ${v.toLowerCase()} view`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => setIndex(i)}
            className={`w-16 overflow-hidden rounded-control border-2 transition-hb lg:w-20 ${
              i === index ? "border-ink" : "border-transparent hover:border-control"
            }`}
          >
            <ProductArt kind={product.art} tone={product.tone} angle={i} />
          </button>
        ))}
      </div>
      <div className="relative flex-1">
        <div role="tabpanel" aria-label={alt(index)} className="overflow-hidden rounded-card border border-border bg-surface">
          <ProductArt kind={product.art} tone={product.tone} angle={index} label={alt(index)} />
        </div>
        <button
          ref={zoomBtn}
          type="button"
          onClick={() => setZoom(true)}
          className="absolute bottom-3 right-3 flex min-h-11 items-center gap-1.5 rounded-full bg-surface/95 px-3 text-sm font-semibold shadow-sm hover:bg-surface"
        >
          <ZoomIn aria-hidden className="size-4" /> Zoom
        </button>
      </div>
      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={`Zoomed: ${alt(index)}`} className="fixed inset-0 z-[80] grid place-items-center bg-ink/90 p-4">
          <button
            type="button"
            autoFocus
            onClick={() => {
              setZoom(false);
              zoomBtn.current?.focus();
            }}
            aria-label="Close zoom"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-surface text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
          <ProductArt kind={product.art} tone={product.tone} angle={index} className="w-full max-w-[min(90vw,80dvh)] rounded-card" />
        </div>
      )}
    </div>
  );
}

/* ---------- Variant selector ---------- */

export function VariantSelector({
  option,
  value,
  onChange,
  showError,
}: {
  option: ProductOption;
  value?: string;
  onChange: (v: string) => void;
  showError?: boolean;
}) {
  const id = `opt-${option.name}`;
  const unavailableSelected = option.values.find((v) => v.label === value && !v.available);
  return (
    <fieldset aria-describedby={showError ? `${id}-err` : undefined}>
      <legend className="mb-2 text-sm">
        <span className="font-semibold">{option.name}:</span>{" "}
        <span className="text-ink-secondary">{value ?? `Choose your ${option.name.toLowerCase()}`}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {option.values.map((v) => {
          const selected = v.label === value;
          return (
            <label
              key={v.label}
              title={v.available ? undefined : v.reason}
              className={`relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-control border px-3 text-sm font-medium transition-hb has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                selected ? "border-ink bg-gold-soft ring-1 ring-ink" : "border-control bg-surface hover:bg-surface-muted"
              } ${v.available ? "" : "text-ink-secondary"}`}
            >
              <input
                type="radio"
                name={id}
                value={v.label}
                checked={selected}
                onChange={() => onChange(v.label)}
                className="sr-only"
                aria-describedby={v.available ? undefined : `${id}-${v.label}-why`}
              />
              {v.swatch && <span aria-hidden className="size-5 rounded-full border border-control" style={{ background: v.swatch }} />}
              <span className={v.available ? "" : "line-through decoration-1"}>{v.label}</span>
              {!v.available && (
                <span id={`${id}-${v.label}-why`} className="sr-only">
                  Unavailable: {v.reason}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {unavailableSelected && (
        <p className="mt-2 text-sm text-danger">
          {option.name} {unavailableSelected.label} is unavailable — {unavailableSelected.reason}.
        </p>
      )}
      {showError && !value && (
        <p id={`${id}-err`} className="mt-2 text-sm font-medium text-danger">
          Choose your {option.name.toLowerCase()} to continue.
        </p>
      )}
    </fieldset>
  );
}

/* ---------- Quantity control ---------- */

export function QuantityControl({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const atMax = value >= max;
  const btn = `grid place-items-center hover:bg-surface-muted disabled:text-border disabled:hover:bg-transparent ${size === "sm" ? "size-10" : "size-11"}`;
  return (
    <div>
      <div className="inline-flex items-center rounded-control border border-control bg-surface" role="group" aria-label={`Quantity for ${label}`}>
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease quantity of ${label}`}>
          <Minus aria-hidden className="size-4" />
        </button>
        <output aria-live="polite" className="tabular w-10 text-center text-sm font-semibold">
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={atMax} aria-label={`Increase quantity of ${label}`}>
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
      {atMax && max > 0 && <p className="mt-1 text-xs text-gold-ink">Maximum available: {max}</p>}
    </div>
  );
}

/* ---------- Purchase panel ---------- */

export function PurchasePanel({ product }: { product: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0].label])),
  );
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");

  const soldOut = product.stock === 0;
  const missing = product.options.filter((o) => !selection[o.name]);
  const blocked = product.options.some((o) => o.values.find((v) => v.label === selection[o.name] && !v.available));

  function addToCart() {
    if (state === "loading") return; // duplicate-submit guard
    setTried(true);
    if (missing.length || blocked || soldOut) return;
    setState("loading");
    setTimeout(() => {
      add(product.slug, selection, qty);
      setState("added");
      toast({ tone: "success", message: `Added ${qty} × ${product.title} to your cart.` });
      setTimeout(() => setState("idle"), 1800);
    }, 500);
  }

  const cta =
    state === "added" ? (
      <>
        <Check aria-hidden className="size-5" /> Added
      </>
    ) : soldOut ? (
      "Sold out"
    ) : (
      <>
        <ShoppingCart aria-hidden className="size-5" /> Add to cart
      </>
    );

  return (
    <div className="space-y-5">
      {product.options.map((o) => (
        <VariantSelector
          key={o.name}
          option={o}
          value={selection[o.name]}
          onChange={(v) => setSelection((s) => ({ ...s, [o.name]: v }))}
          showError={tried}
        />
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <QuantityControl value={qty} max={Math.max(1, product.stock)} onChange={setQty} label={product.title} />
        <StockLine stock={product.stock} />
      </div>

      <div className="hidden gap-3 sm:flex">
        <Button size="lg" className="flex-1" onClick={addToCart} loading={state === "loading"} disabled={soldOut}>
          {cta}
        </Button>
        <Link
          href="/cart"
          className="inline-flex min-h-12 items-center justify-center rounded-control border border-control bg-surface px-6 font-semibold hover:bg-surface-muted"
        >
          View cart
        </Link>
      </div>

      {/* Mobile sticky purchase bar; layout reserves its height via pb on the page. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="min-w-0">
          <p className="tabular text-[18px] font-bold leading-6">{formatPrice(product.price * qty)}</p>
          <p className="truncate text-xs text-ink-secondary">
            {missing.length ? `Choose ${missing.map((m) => m.name.toLowerCase()).join(" and ")}` : `Qty ${qty}`}
          </p>
        </div>
        <Button className="ml-auto flex-1" size="lg" onClick={addToCart} loading={state === "loading"} disabled={soldOut}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
