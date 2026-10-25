"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireOwner } from "@/lib/auth";
import { uniqueSlug, slugify } from "@/lib/slug";
import { echo, type FormState } from "@/lib/formState";

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().int().min(0).max(1_000_000).optional(),
);

const storeSchema = z.object({
  name: z.string().trim().min(2, "Enter your store name.").max(80),
  city: z.string().trim().min(2, "Choose a city.").max(60),
  tagline: z.string().trim().max(140).default(""),
  description: z.string().trim().max(2000).default(""),
  contactPhone: z.string().trim().max(30).optional(),
  deliveryFee: z.coerce.number().int("Whole rupees only.").min(0).max(100_000),
  freeDeliveryOver: optionalInt,
  dispatchDays: z.string().trim().min(1, "e.g. 1–2 days").max(40),
  returnPolicy: z.string().trim().max(500).default(""),
  isOpen: z.preprocess((v) => v === "on", z.boolean()),
});

export async function saveStore(_: FormState, form: FormData): Promise<FormState> {
  const { user, store } = await requireOwner();
  const parsed = storeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      error: "Check the highlighted fields.",
      values: echo(form),
      fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
    };
  }
  const data = { ...parsed.data, contactPhone: parsed.data.contactPhone || null, freeDeliveryOver: parsed.data.freeDeliveryOver ?? null };

  if (store) {
    // Slug stays stable after creation so shared links keep working.
    await db.update(stores).set(data).where(eq(stores.id, store.id));
    revalidatePath("/", "layout");
    return { ok: true, message: "Store details saved.", values: echo(form) };
  }

  let slug = slugify(data.name);
  const [taken] = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
  if (taken) slug = uniqueSlug(data.name);
  await db.insert(stores).values({ ...data, slug, ownerId: user.id });
  revalidatePath("/", "layout");
  redirect("/dashboard/products/new?welcome=1");
}
