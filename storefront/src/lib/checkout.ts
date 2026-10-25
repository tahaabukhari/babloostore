import { and, eq, gt, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, stores } from "@/db/schema";
import { deliveryFee } from "./delivery";
import { orderNumber } from "./slug";

export type CheckoutContact = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
};
export type CheckoutLine = { productId: string; qty: number; options: Record<string, string> };

export class CheckoutError extends Error {
  constructor(
    message: string,
    public staleIds: string[] = [],
  ) {
    super(message);
  }
}

/**
 * Creates one order per store for a checkout, inside one transaction.
 * Prices come from the database; stock is reserved with a guarded UPDATE so
 * two shoppers can't both buy the last unit. Throws CheckoutError for problems
 * the shopper can fix.
 */
export async function createOrders(checkoutId: string, c: CheckoutContact, lines: CheckoutLine[], userId: string | null) {
  await db.transaction(async (tx) => {
    const ids = [...new Set(lines.map((l) => l.productId))];
    const rows = await tx
      .select({ product: products, store: stores })
      .from(products)
      .innerJoin(stores, eq(stores.id, products.storeId))
      .where(and(inArray(products.id, ids), eq(products.status, "active"), eq(stores.isOpen, true), gt(products.price, 0)));
    const byId = new Map(rows.map((r) => [r.product.id, r]));

    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) throw new CheckoutError("Some items are no longer available. We've marked them in your cart.", missing);

    // Validate chosen options against the product's current options.
    for (const l of lines) {
      const p = byId.get(l.productId)!.product;
      for (const o of p.options) {
        if (!o.values.includes(l.options[o.name] ?? "")) {
          throw new CheckoutError(`Choose a ${o.name.toLowerCase()} for “${p.title}”.`, [p.id]);
        }
      }
    }

    // Reserve stock atomically: the WHERE guard makes concurrent last-unit purchases safe.
    for (const l of lines) {
      const [ok] = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${l.qty}` })
        .where(and(eq(products.id, l.productId), gte(products.stock, l.qty)))
        .returning({ id: products.id });
      if (!ok) {
        const p = byId.get(l.productId)!.product;
        throw new CheckoutError(`Only ${p.stock} of “${p.title}” left. Lower the quantity and try again.`, [p.id]);
      }
    }

    // One order per store; prices always come from the database.
    const byStore = new Map<string, typeof lines>();
    for (const l of lines) {
      const sid = byId.get(l.productId)!.store.id;
      byStore.set(sid, [...(byStore.get(sid) ?? []), l]);
    }
    for (const [storeId, storeLines] of byStore) {
      const store = byId.get(storeLines[0].productId)!.store;
      const subtotal = storeLines.reduce((n, l) => n + byId.get(l.productId)!.product.price * l.qty, 0);
      const fee = deliveryFee(store, subtotal);
      const [order] = await tx
        .insert(orders)
        .values({
          orderNo: orderNumber(),
          checkoutId,
          storeId,
          userId: userId,
          customerName: c.name,
          phone: c.phone,
          email: c.email || null,
          address: c.address,
          city: c.city,
          notes: c.notes || null,
          subtotal,
          deliveryFee: fee,
          total: subtotal + fee,
        })
        .returning({ id: orders.id });
      await tx.insert(orderItems).values(
        storeLines.map((l) => {
          const p = byId.get(l.productId)!.product;
          return {
            orderId: order.id,
            productId: p.id,
            title: p.title,
            imageUrl: p.images[0] ?? null,
            unitPrice: p.price,
            qty: l.qty,
            options: l.options,
          };
        }),
      );
    }
  });
}
