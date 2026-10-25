import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, stores } from "@/db/schema";

/** All store orders created by one checkout. The checkout id is an unguessable UUID. */
export async function getCheckout(checkoutId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(checkoutId)) return null;
  const rows = await db
    .select({ order: orders, storeName: stores.name, storeSlug: stores.slug, storePhone: stores.contactPhone, dispatchDays: stores.dispatchDays })
    .from(orders)
    .innerJoin(stores, eq(stores.id, orders.storeId))
    .where(eq(orders.checkoutId, checkoutId));
  if (!rows.length) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.order.id)));
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.orderId === r.order.id) }));
}

export async function listUserOrders(userId: string) {
  return db
    .select({
      id: orders.id,
      orderNo: orders.orderNo,
      checkoutId: orders.checkoutId,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      storeName: stores.name,
    })
    .from(orders)
    .innerJoin(stores, eq(stores.id, orders.storeId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50);
}
