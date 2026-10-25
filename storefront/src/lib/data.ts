// Static catalog constants shared by client and server code.
// Products, stores and orders live in the database (see src/db/schema.ts).

export type CategorySlug = "fashion" | "beauty" | "jewellery" | "electronics" | "home";

export type ArtKind =
  | "shirt"
  | "dress"
  | "shoe"
  | "bag"
  | "perfume"
  | "lipstick"
  | "ring"
  | "watch"
  | "glasses"
  | "headphones"
  | "cable"
  | "speaker"
  | "lamp"
  | "sofa"
  | "cup"
  | "bed";

export type Category = {
  slug: CategorySlug;
  name: string;
  short: string;
  icon: ArtKind;
  tone: string;
  blurb: string;
};

export const categories: Category[] = [
  { slug: "fashion", name: "Fashion", short: "Fashion", icon: "shirt", tone: "#E9D8C4", blurb: "Lawn, kurtas, footwear and bags" },
  { slug: "beauty", name: "Beauty & Fragrances", short: "Beauty", icon: "perfume", tone: "#E8D3A6", blurb: "Attars, skincare and makeup" },
  { slug: "jewellery", name: "Jewellery & Accessories", short: "Jewellery", icon: "ring", tone: "#EFDCAE", blurb: "Everyday and occasion pieces" },
  { slug: "electronics", name: "Electronic Accessories", short: "Electronics", icon: "headphones", tone: "#D3DAE0", blurb: "Audio, charging and wearables" },
  { slug: "home", name: "Home & Living", short: "Home", icon: "lamp", tone: "#ECDDBF", blurb: "Lighting, linen and kitchen" },
];

export const optionNames = ["Size", "Colour", "Volume", "Length", "Style"] as const;

export const budgets = [
  { label: "Under Rs. 1,500", max: 1500 },
  { label: "Under Rs. 3,000", max: 3000 },
  { label: "Under Rs. 5,000", max: 5000 },
  { label: "Gifts under Rs. 10,000", max: 10000 },
];

export const deliveryCities = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
];

export function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function categoryArt(slug: string) {
  const c = getCategory(slug);
  return { kind: c?.icon ?? ("bag" as ArtKind), tone: c?.tone ?? "#E5E0D6" };
}

export function discountPercent(p: { price: number; compareAt?: number | null }) {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

export type SortKey = "relevance" | "price-asc" | "price-desc" | "newest";

export type SearchParams = {
  q?: string;
  category?: string;
  store?: string;
  max?: string;
  min?: string;
  instock?: string;
  sort?: string;
};

// Roman Urdu / common-misspelling synonyms (curated, per product requirements).
export const synonyms: Record<string, string> = {
  kapray: "lawn",
  kapde: "lawn",
  khushbu: "attar",
  perfum: "perfume",
  ghari: "watch",
  chashma: "sunglasses",
  chadar: "bedsheet",
  jhumki: "jhumka",
  earbud: "earbuds",
};

/** Public product shape used by cards, rows and the cart. */
export type CardProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  compareAt: number | null;
  stock: number;
  image: string | null;
  storeName: string;
  storeSlug: string;
  storeCity: string;
};
