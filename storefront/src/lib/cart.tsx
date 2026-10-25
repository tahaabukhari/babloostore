"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// The cart only stores what the shopper picked. Prices, stock and titles are
// always re-read from the database (cart page and checkout), never trusted from here.
export type CartLine = {
  id: string;
  productId: string;
  options: Record<string, string>;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (productId: string, options: Record<string, string>, qty: number, max: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => CartLine | undefined;
  restore: (line: CartLine) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "bs-cart-v2";

export function lineId(productId: string, options: Record<string, string>) {
  return `${productId}|${Object.entries(options)
    .map(([k, v]) => `${k}:${v}`)
    .join(",")}`;
}

function isLine(x: unknown): x is CartLine {
  const l = x as CartLine;
  return !!l && typeof l.productId === "string" && typeof l.qty === "number" && typeof l.options === "object";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(raw)) setLines(raw.filter(isLine));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((productId: string, options: Record<string, string>, qty: number, max: number) => {
    const id = lineId(productId, options);
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(max, l.qty + qty) } : l));
      return [...prev, { id, productId, options, qty: Math.min(max, qty) }];
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

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, ready, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, restore, clear }),
    [lines, ready, add, setQty, remove, restore, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
