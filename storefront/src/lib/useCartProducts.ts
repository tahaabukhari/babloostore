"use client";

import { useEffect, useMemo, useState } from "react";
import { getCartProducts, type CartProductInfo } from "@/app/actions/checkout";
import { deliveryFee } from "./delivery";
import { useCart, type CartLine } from "./cart";

export type CartRow = CartLine & { product?: CartProductInfo };
export type CartGroup = {
  store: CartProductInfo["store"];
  rows: (CartLine & { product: CartProductInfo })[];
  subtotal: number;
  fee: number;
};

/** Cart lines joined with live product data, grouped by store. */
export function useCartProducts() {
  const cart = useCart();
  const [products, setProducts] = useState<Map<string, CartProductInfo> | null>(null);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);
  const idsKey = [...new Set(cart.lines.map((l) => l.productId))].sort().join(",");

  useEffect(() => {
    if (!cart.ready) return;
    if (!idsKey) return setProducts(new Map());
    let live = true;
    getCartProducts(idsKey.split(","))
      .then((list) => {
        if (live) {
          setProducts(new Map(list.map((p) => [p.id, p])));
          setError(false);
        }
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [idsKey, cart.ready, version]);

  return useMemo(() => {
    const rows: CartRow[] = cart.lines.map((l) => ({ ...l, product: products?.get(l.productId) }));
    const available = rows.filter((r): r is CartLine & { product: CartProductInfo } => !!r.product);
    const unavailable = products ? rows.filter((r) => !r.product) : [];
    const groupMap = new Map<string, CartGroup>();
    for (const r of available) {
      const g = groupMap.get(r.product.store.id) ?? { store: r.product.store, rows: [], subtotal: 0, fee: 0 };
      g.rows.push(r);
      g.subtotal += r.product.price * r.qty;
      groupMap.set(r.product.store.id, g);
    }
    const groups = [...groupMap.values()].map((g) => ({ ...g, fee: deliveryFee(g.store, g.subtotal) }));
    const itemsTotal = groups.reduce((n, g) => n + g.subtotal, 0);
    const deliveryTotal = groups.reduce((n, g) => n + g.fee, 0);
    const overStock = available.filter((r) => r.qty > r.product.stock);
    const missingOptions = available.filter((r) => r.product.options.some((o) => !o.values.includes(r.options[o.name] ?? "")));
    return {
      ...cart,
      loading: !cart.ready || (products === null && !error),
      error,
      reload: () => setVersion((v) => v + 1),
      groups,
      unavailable,
      itemsTotal,
      deliveryTotal,
      overStock,
      missingOptions,
      itemCount: available.reduce((n, r) => n + r.qty, 0),
    };
  }, [cart, products, error]);
}
