import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Money is whole PKR (integer); there are no paisa amounts in the storefront.

export const userRole = pgEnum("user_role", ["customer", "owner", "admin"]);
export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const orderStatus = pgEnum("order_status", ["new", "confirmed", "shipped", "delivered", "cancelled"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // stored lower-cased
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("customer"),
  ...timestamps,
});

// Session id is the SHA-256 of the cookie token, so a leaked table can't be replayed.
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    city: text("city").notNull().default("Lahore"),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    contactPhone: text("contact_phone"),
    deliveryFee: integer("delivery_fee").notNull().default(200),
    freeDeliveryOver: integer("free_delivery_over"),
    dispatchDays: text("dispatch_days").notNull().default("1–3 days"),
    returnPolicy: text("return_policy").notNull().default(""),
    verified: boolean("verified").notNull().default(false),
    isOpen: boolean("is_open").notNull().default(true),
    ...timestamps,
  },
  (t) => [check("stores_fee_nonneg", sql`${t.deliveryFee} >= 0`)],
);

export type ProductOptionRow = { name: string; values: string[] };

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
    category: text("category").notNull(),
    price: integer("price").notNull(),
    compareAt: integer("compare_at"),
    stock: integer("stock").notNull().default(0),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    options: jsonb("options").$type<ProductOptionRow[]>().notNull().default([]),
    warranty: text("warranty"),
    status: productStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("products_store_idx").on(t.storeId),
    index("products_status_category_idx").on(t.status, t.category),
    check("products_price_nonneg", sql`${t.price} >= 0`),
    check("products_stock_nonneg", sql`${t.stock} >= 0`),
  ],
);

// One checkout creates one order per store (stores ship separately).
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNo: text("order_no").notNull().unique(),
    checkoutId: uuid("checkout_id").notNull(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    notes: text("notes"),
    paymentMethod: text("payment_method").notNull().default("cod"),
    status: orderStatus("status").notNull().default("new"),
    subtotal: integer("subtotal").notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    total: integer("total").notNull(),
    ...timestamps,
  },
  (t) => [
    index("orders_store_created_idx").on(t.storeId, t.createdAt),
    index("orders_checkout_idx").on(t.checkoutId),
    index("orders_user_idx").on(t.userId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    // Snapshot at purchase time so later product edits don't rewrite history.
    title: text("title").notNull(),
    imageUrl: text("image_url"),
    unitPrice: integer("unit_price").notNull(),
    qty: integer("qty").notNull(),
    options: jsonb("options").$type<Record<string, string>>().notNull().default({}),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderStatus = (typeof orderStatus.enumValues)[number];
