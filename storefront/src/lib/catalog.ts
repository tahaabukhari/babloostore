import { and, asc, count, desc, eq, gt, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { synonyms, type CardProduct, type SearchParams } from "./data";

// Public reads only ever see active products from open stores.
const visible = and(eq(products.status, "active"), eq(stores.isOpen, true));

const cardColumns = {
  id: products.id,
  slug: products.slug,
  title: products.title,
  category: products.category,
  price: products.price,
  compareAt: products.compareAt,
  stock: products.stock,
  image: sql<string | null>`${products.images}->>0`,
  storeName: stores.name,
  storeSlug: stores.slug,
  storeCity: stores.city,
};

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function filters(params: SearchParams): SQL[] {
  const where: SQL[] = [visible!];
  const terms = (params.q ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .map((t) => synonyms[t] ?? t);
  for (const t of terms) {
    where.push(
      sql`concat_ws(' ', ${products.title}, ${products.description}, ${products.category}, ${stores.name}) ilike ${`%${escapeLike(t)}%`}`,
    );
  }
  if (params.category) where.push(eq(products.category, params.category));
  if (params.store) where.push(eq(stores.slug, params.store));
  const min = Number(params.min);
  const max = Number(params.max);
  if (params.min && Number.isFinite(min)) where.push(gte(products.price, min));
  if (params.max && Number.isFinite(max)) where.push(lte(products.price, max));
  if (params.instock === "1") where.push(gt(products.stock, 0));
  return where;
}

export async function searchProducts(params: SearchParams, limit = 60): Promise<CardProduct[]> {
  const order =
    params.sort === "price-asc"
      ? [asc(products.price)]
      : params.sort === "price-desc"
        ? [desc(products.price)]
        : // "relevance" falls back to newest until we have real ranking.
          [desc(products.createdAt)];
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(...filters(params)))
    .orderBy(...order)
    .limit(limit);
}

export async function countProducts(params: SearchParams) {
  const [row] = await db
    .select({ n: count() })
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(...filters(params)));
  return row?.n ?? 0;
}

export async function latestProducts(limit = 12) {
  return searchProducts({ sort: "newest" }, limit);
}

export async function dealProducts(limit = 6) {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(visible, gt(products.compareAt, products.price)))
    .orderBy(desc(products.updatedAt))
    .limit(limit);
}

export async function suggestProducts(q: string, limit = 6) {
  if (!q.trim()) return [];
  const rows = await searchProducts({ q }, limit);
  return rows.map((r) => ({ slug: r.slug, title: r.title }));
}

export async function getPublicProduct(slug: string) {
  const [row] = await db
    .select({ product: products, store: stores })
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(eq(products.slug, slug), visible))
    .limit(1);
  return row ?? null;
}

export async function moreFromStore(storeId: string, excludeId: string, limit = 6) {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(visible, eq(products.storeId, storeId), sql`${products.id} <> ${excludeId}`))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function relatedProducts(category: string, excludeId: string, limit = 6) {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(stores, eq(stores.id, products.storeId))
    .where(and(visible, eq(products.category, category), sql`${products.id} <> ${excludeId}`))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function listStores() {
  return db
    .select({ slug: stores.slug, name: stores.name, city: stores.city })
    .from(stores)
    .where(eq(stores.isOpen, true))
    .orderBy(asc(stores.name));
}

/** Stores with at least one live product, plus up to three product thumbnails each. */
export async function featuredStores(limit = 4) {
  const rows = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      name: stores.name,
      city: stores.city,
      tagline: stores.tagline,
      verified: stores.verified,
      createdAt: stores.createdAt,
      productCount: count(products.id),
    })
    .from(stores)
    .innerJoin(products, and(eq(products.storeId, stores.id), eq(products.status, "active")))
    .where(eq(stores.isOpen, true))
    .groupBy(stores.id)
    .orderBy(desc(count(products.id)))
    .limit(limit);
  if (!rows.length) return [];
  const thumbs = await db
    .select({ storeId: products.storeId, slug: products.slug, title: products.title, category: products.category, image: sql<string | null>`${products.images}->>0` })
    .from(products)
    .where(and(eq(products.status, "active"), inArray(products.storeId, rows.map((r) => r.id))))
    .orderBy(desc(products.createdAt));
  return rows.map((r) => ({ ...r, items: thumbs.filter((t) => t.storeId === r.id).slice(0, 3) }));
}

export async function getPublicStore(slug: string) {
  const [store] = await db.select().from(stores).where(and(eq(stores.slug, slug), eq(stores.isOpen, true))).limit(1);
  return store ?? null;
}
