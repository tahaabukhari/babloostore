"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products, type ProductOptionRow } from "@/db/schema";
import { requireOwnerStore } from "@/lib/auth";
import { categories } from "@/lib/data";
import { uniqueSlug } from "@/lib/slug";
import { echo, type FormState } from "@/lib/formState";

// Lenient on purpose (owner request, Oct 2026): a product always saves, whatever
// is filled in. Missing or invalid values fall back to safe defaults, and the
// products list flags what still needs filling. Price 0 can't be bought.

const text = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Whole number in range, or the fallback when blank / not a number. Accepts "2,500" and "Rs. 2500". */
function int(v: FormDataEntryValue | null, fallback: number, max: number) {
  const n = Math.round(Number(String(v ?? "").replace(/[^\d.]/g, "")));
  return String(v ?? "").trim() === "" || !Number.isFinite(n) ? fallback : Math.min(Math.max(n, 0), max);
}

const isImage = (s: string) => /^\/media\/[\w/.-]+$/.test(s) || /^https?:\/\/\S+$/.test(s);
const categorySlugs = new Set<string>(categories.map((c) => c.slug));

function parseOptions(form: FormData): ProductOptionRow[] {
  const options: ProductOptionRow[] = [];
  for (const i of [1, 2]) {
    const name = text(form.get(`option${i}Name`), 40);
    const values = [
      ...new Set(
        String(form.get(`option${i}Values`) ?? "")
          .split(",")
          .map((s) => s.trim().slice(0, 40))
          .filter(Boolean),
      ),
    ].slice(0, 20);
    // An option without a name or without values is ignored rather than blocking the save.
    if (name && values.length) options.push({ name, values });
  }
  return options;
}

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireOwnerStore();
  const price = int(form.get("price"), 0, 10_000_000);
  const compareAt = int(form.get("compareAt"), 0, 10_000_000);
  const category = text(form.get("category"), 40);
  const intent = form.get("intent") === "active" ? "active" : "draft";

  const values = {
    title: text(form.get("title"), 140) || "Untitled product",
    category: categorySlugs.has(category) ? category : "other",
    description: text(form.get("description"), 5000),
    highlights: lines(form.get("highlights")).map((h) => h.slice(0, 160)).slice(0, 10),
    price,
    compareAt: compareAt > price && price > 0 ? compareAt : null,
    stock: int(form.get("stock"), 1, 100_000),
    images: lines(form.get("images")).filter(isImage).slice(0, 6),
    warranty: text(form.get("warranty"), 200) || null,
    options: parseOptions(form),
    status: intent as "active" | "draft",
  };
  const id = String(form.get("id") ?? "");

  try {
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
  } catch (e) {
    console.error("saveProduct failed", e);
    return { error: "Couldn't save the product. Check your connection and try again.", values: echo(form) };
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
