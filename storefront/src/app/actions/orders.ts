"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, products, type OrderStatus } from "@/db/schema";
import { requireOwnerStore } from "@/lib/auth";
import { nextStatuses } from "@/lib/orderFlow";

export async function updateOrderStatus(orderId: string, next: OrderStatus): Promise<{ error?: string }> {
  const { store } = await requireOwnerStore();
  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, store.id)))
      .for("update")
      .limit(1);
    if (!order) return { error: "Order not found." };
    if (!nextStatuses[order.status].includes(next)) {
      return { error: `An order that is ${order.status} can't be marked ${next}.` };
    }
    await tx.update(orders).set({ status: next }).where(eq(orders.id, order.id));
    if (next === "cancelled") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const item of items) {
        if (!item.productId) continue;
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.qty}` })
          .where(eq(products.id, item.productId));
      }
    }
    return {};
  });
  revalidatePath("/dashboard", "layout");
  return result;
}
