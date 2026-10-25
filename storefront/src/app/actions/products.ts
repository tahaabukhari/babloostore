"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { products, type ProductOptionRow } from "@/db/schema";
import { requireOwnerStore } from "@/lib/auth";
import { categories } from "@/lib/data";
import { uniqueSlug } from "@/lib/slug";
import { echo, type FormState } from "@/lib/formState";

const lines = (v: unknown) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const productSchema = z
  .object({
    title: z.string().trim().min(3, "Use at least 3 characters.").max(140),
    category: z.enum(categories.map((c) => c.slug) as [string, ...string[]], "Choose a category."),
    description: z.string().trim().max(5000).default(""),
    highlights: z.preprocess(lines, z.array(z.string().max(160)).max(10, "Up to 10 highlights.")),
    price: z.coerce.number("Enter a price.").int("Whole rupees only.").min(1, "Price must be at least Rs. 1.").max(10_000_000),
    compareAt: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number().int("Whole rupees only.").min(1).max(10_000_000).optional(),
    ),
    stock: z.coerce.number().int("Whole numbers only.").min(0).max(100_000),
    images: z.preprocess(
      lines,
      z.array(z.url({ protocol: /^https?$/, error: "Each line must be a full image link starting with https://" })).max(6, "Up to 6 images."),
    ),
    warranty: z.string().trim().max(200).optional(),
    intent: z.enum(["draft", "active"]).default("draft"),
  })
  .refine((d) => d.compareAt === undefined || d.compareAt > d.price, {
    path: ["compareAt"],
    message: "Compare-at price must be higher than the price, or leave it empty.",
  });

function parseOptions(form: FormData): { options: ProductOptionRow[]; error?: string } {
  const options: ProductOptionRow[] = [];
  for (const i of [1, 2]) {
    const name = String(form.get(`option${i}Name`) ?? "").trim();
    const values = [
      ...new Set(
        String(form.get(`option${i}Values`) ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    if (!name && !values.length) continue;
    if (!name || !values.length) return { options, error: `Option ${i} needs a name and at least one value.` };
    if (values.length > 20) return { options, error: `Option ${i} can have up to 20 values.` };
    options.push({ name, values: values.map((v) => v.slice(0, 40)) });
  }
  return { options };
}

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireOwnerStore();
  const raw = Object.fromEntries(form);
  const parsed = productSchema.safeParse(raw);
  const { options, error: optionError } = parseOptions(form);
  if (!parsed.success || optionError) {
    const fieldErrors = parsed.success
      ? {}
      : Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    if (optionError) fieldErrors.options = optionError;
    return { error: "Check the highlighted fields.", fieldErrors, values: echo(form) };
  }
  const { intent, warranty, compareAt, ...rest } = parsed.data;
  const values = { ...rest, warranty: warranty || null, compareAt: compareAt ?? null, options, status: intent };
  const id = String(form.get("id") ?? "");

  if (id) {
    const [updated] = await db
      .update(products)
      .set(values)
      .where(and(eq(products.id, id), eq(products.storeId, store.id)))
      .returning({ slug: products.slug });
    if (!updated) return { error: "That product no longer exists.", values: echo(form) };
  } else {
    await db.insert(products).values({ ...values, storeId: store.id, slug: uniqueSlug(values.title) });
  }
  revalidatePath("/", "layout");
  redirect(`/dashboard/products?saved=${intent === "active" ? "published" : "draft"}`);
}

export async function setProductStatus(id: string, status: "draft" | "active" | "archived") {
  const { store } = await requireOwnerStore();
  await db
    .update(products)
    .set({ status })
    .where(and(eq(products.id, id), eq(products.storeId, store.id)));
  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  const { store } = await requireOwnerStore();
  // Past order lines keep their snapshot (title/price) via ON DELETE SET NULL.
  await db.delete(products).where(and(eq(products.id, id), eq(products.storeId, store.id)));
  revalidatePath("/", "layout");
  redirect("/dashboard/products?saved=deleted");
}
