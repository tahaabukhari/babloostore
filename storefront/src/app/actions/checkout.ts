"use server";

import { randomUUID } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { CheckoutError, createOrders } from "@/lib/checkout";

export type CartProductInfo = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  image: string | null;
  options: { name: string; values: string[] }[];
  store: {
    id: string;
    slug: string;
    name: string;
    city: string;
    verified: boolean;
    dispatchDays: string;
    deliveryFee: number;
    freeDeliveryOver: number | null;
  };
};

const uuid = z.uuid();

/** Live product data for the cart. Unavailable products are simply missing from the result. */
export async function getCartProducts(ids: string[]): Promise<CartProductInfo[]> {
  const valid = [...new Set(ids)].filter((id) => uuid.safeParse(id).success).slice(0, 100);
  if (!valid.length) return [];
  const rows = await db
    .select({ product: products, store: stores })
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(inArray(products.id, valid), eq(products.status, "active"), eq(stores.isOpen, true), gt(products.price, 0)));
  return rows.map(({ product: p, store: s }) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    price: p.price,
    stock: p.stock,
    image: p.images[0] ?? null,
    options: p.options,
    store: {
      id: s.id,
      slug: s.slug,
      name: s.name,
      city: s.city,
      verified: s.verified,
      dispatchDays: s.dispatchDays,
      deliveryFee: s.deliveryFee,
      freeDeliveryOver: s.freeDeliveryOver,
    },
  }));
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter the name the courier should ask for.").max(80),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+92|0)3\d{9}$/, "Enter a mobile number like 0300 1234567.")),
  email: z.union([z.literal(""), z.email("Enter a valid email or leave it empty.")]).optional(),
  address: z.string().trim().min(8, "Enter house/street, area — enough for the courier to find you.").max(300),
  city: z.string().trim().min(2, "Choose your city.").max(60),
  notes: z.string().trim().max(500).optional(),
});

const linesSchema = z
  .array(
    z.object({
      productId: z.uuid(),
      qty: z.number().int().min(1).max(99),
      options: z.record(z.string(), z.string().max(40)),
    }),
  )
  .min(1, "Your cart is empty.")
  .max(50);

export type PlaceOrderResult =
  | { ok: true; checkoutId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; staleIds?: string[] };

export async function placeOrder(contactInput: unknown, linesInput: unknown): Promise<PlaceOrderResult> {
  const contact = contactSchema.safeParse(contactInput);
  if (!contact.success) {
    return {
      ok: false,
      error: "Check your delivery details.",
      fieldErrors: Object.fromEntries(contact.error.issues.map((i) => [String(i.path[0]), i.message])),
    };
  }
  const lines = linesSchema.safeParse(linesInput);
  if (!lines.success) return { ok: false, error: lines.error.issues[0]?.message ?? "Your cart couldn't be read." };

  const checkoutId = randomUUID();

  try {
    await createOrders(checkoutId, contact.data, lines.data, null);
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message, staleIds: e.staleIds };
    console.error("placeOrder failed", e);
    return { ok: false, error: "We couldn't place your order. Nothing was charged — please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true, checkoutId };
}
