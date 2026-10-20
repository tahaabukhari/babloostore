"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "./data";

export type CartLine = {
  id: string;
  slug: string;
  variant: Record<string, string>;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (slug: string, variant: Record<string, string>, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => CartLine | undefined;
  restore: (line: CartLine) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "hb-cart-v1";

// Seeded two-seller cart so the multi-vendor layout can be reviewed on first load.
const seed: CartLine[] = [
  { id: "printed-lawn-3pc-suit|Colour:Sage", slug: "printed-lawn-3pc-suit", variant: { Colour: "Sage" }, qty: 1 },
  { id: "oud-attar-12ml|Volume:12 ml", slug: "oud-attar-12ml", variant: { Volume: "12 ml" }, qty: 2 },
  { id: "brass-table-lamp|", slug: "brass-table-lamp", variant: {}, qty: 3 },
];

export function lineId(slug: string, variant: Record<string, string>) {
  return `${slug}|${Object.entries(variant)
    .map(([k, v]) => `${k}:${v}`)
    .join(",")}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial = seed;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) initial = (JSON.parse(raw) as CartLine[]).filter((l) => getProduct(l.slug));
    } catch {}
    setLines(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((slug: string, variant: Record<string, string>, qty: number) => {
    const id = lineId(slug, variant);
    const stock = getProduct(slug)?.stock ?? 0;
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(stock, l.qty + qty) } : l));
      return [...prev, { id, slug, variant, qty: Math.min(stock, qty) }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)));
  }, []);

  const remove = useCallback(
    (id: string) => {
      const line = lines.find((l) => l.id === id);
      setLines((prev) => prev.filter((l) => l.id !== id));
      return line;
    },
    [lines],
  );

  const restore = useCallback((line: CartLine) => {
    setLines((prev) => (prev.some((l) => l.id === line.id) ? prev : [...prev, line]));
  }, []);

  const value = useMemo(
    () => ({ lines, ready, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, restore }),
    [lines, ready, add, setQty, remove, restore],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
