import { and, count, desc, eq, gte, lte, ne, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, type OrderStatus } from "@/db/schema";

// Every query here is scoped by storeId — owners only ever see their own store.

export async function orderCounts(storeId: string) {
  const rows = await db
    .select({ status: orders.status, n: count() })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .groupBy(orders.status);
  const map = Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<OrderStatus, number>>;
  return { ...map, all: rows.reduce((n, r) => n + r.n, 0) };
}

export async function listOrders(storeId: string, status?: OrderStatus, limit = 100) {
  const where = status ? and(eq(orders.storeId, storeId), eq(orders.status, status)) : eq(orders.storeId, storeId);
  const rows = await db
    .select({
      id: orders.id,
      orderNo: orders.orderNo,
      customerName: orders.customerName,
      city: orders.city,
      phone: orders.phone,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      // Written out by hand: interpolated columns render unqualified inside a subquery.
      items: sql<number>`(select coalesce(sum(oi.qty), 0)::int from order_items oi where oi.order_id = "orders"."id")`,
    })
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows;
}

export async function getOwnerOrder(storeId: string, orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function salesSummary(storeId: string, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const [row] = await db
    .select({ orders: count(), value: sum(orders.total) })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, since), ne(orders.status, "cancelled")));
  return { orders: row?.orders ?? 0, value: Number(row?.value ?? 0) };
}

export async function listOwnerProducts(storeId: string) {
  return db.select().from(products).where(eq(products.storeId, storeId)).orderBy(desc(products.updatedAt));
}

export async function getOwnerProduct(storeId: string, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.storeId, storeId)))
    .limit(1);
  return p ?? null;
}

export async function lowStock(storeId: string, threshold = 3) {
  return db
    .select({ id: products.id, title: products.title, stock: products.stock })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.status, "active"), lte(products.stock, threshold)))
    .orderBy(products.stock)
    .limit(8);
}

export async function productCounts(storeId: string) {
  const rows = await db
    .select({ status: products.status, n: count() })
    .from(products)
    .where(eq(products.storeId, storeId))
    .groupBy(products.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<"draft" | "active" | "archived", number>>;
}

