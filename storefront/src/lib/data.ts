// Illustrative catalog for the Pass 1 design prototype.
// Prices, stock, stores and reviews are NOT real and must be replaced by the
// commerce backend before any public release (see docs/05-delivery-plan.md).

export type CategorySlug = "fashion" | "beauty" | "jewellery" | "electronics" | "home";

export type Category = {
  slug: CategorySlug;
  name: string;
  short: string;
  icon: ArtKind;
  blurb: string;
};

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

export type Store = {
  slug: string;
  name: string;
  city: string;
  since: number;
  verified: boolean;
  verification: string;
  tagline: string;
  dispatchDays: string;
  deliveryFee: number;
  freeDeliveryOver?: number;
  returnPolicy: string;
};

export type OptionValue = {
  label: string;
  swatch?: string;
  available: boolean;
  reason?: string;
};

export type ProductOption = {
  name: "Size" | "Colour" | "Volume" | "Length";
  values: OptionValue[];
};

export type Product = {
  slug: string;
  title: string;
  brand: string;
  category: CategorySlug;
  store: string;
  price: number;
  compareAt?: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  art: ArtKind;
  tone: string;
  options: ProductOption[];
  highlights: string[];
  description: string;
  warranty?: string;
  tags: string[];
  createdRank: number;
};

export const categories: Category[] = [
  { slug: "fashion", name: "Fashion", short: "Fashion", icon: "shirt", blurb: "Lawn, kurtas, footwear and bags" },
  { slug: "beauty", name: "Beauty & Fragrances", short: "Beauty", icon: "perfume", blurb: "Attars, skincare and makeup" },
  { slug: "jewellery", name: "Jewellery & Accessories", short: "Jewellery", icon: "ring", blurb: "Everyday and occasion pieces" },
  { slug: "electronics", name: "Electronic Accessories", short: "Electronics", icon: "headphones", blurb: "Audio, charging and wearables" },
  { slug: "home", name: "Home & Living", short: "Home", icon: "lamp", blurb: "Lighting, linen and kitchen" },
];

export const stores: Store[] = [
  {
    slug: "noor-textiles",
    name: "Noor Textiles",
    city: "Faisalabad",
    since: 2019,
    verified: true,
    verification: "Business registration and return address checked by HomeBEZ",
    tagline: "Unstitched lawn and ready-to-wear from our own looms.",
    dispatchDays: "1–2 days",
    deliveryFee: 199,
    freeDeliveryOver: 5000,
    returnPolicy: "7-day return for unworn items with tags",
  },
  {
    slug: "attar-house",
    name: "Attar House",
    city: "Lahore",
    since: 2016,
    verified: true,
    verification: "Business registration and return address checked by HomeBEZ",
    tagline: "Small-batch attars and eau de parfum blended in Lahore.",
    dispatchDays: "1–3 days",
    deliveryFee: 249,
    returnPolicy: "Sealed items only; 7-day return",
  },
  {
    slug: "zevar-studio",
    name: "Zevar Studio",
    city: "Karachi",
    since: 2021,
    verified: true,
    verification: "Business registration and return address checked by HomeBEZ",
    tagline: "Gold-plated and silver everyday jewellery.",
    dispatchDays: "2–3 days",
    deliveryFee: 150,
    freeDeliveryOver: 3500,
    returnPolicy: "14-day return; earrings non-returnable for hygiene",
  },
  {
    slug: "volt-lane",
    name: "Volt Lane",
    city: "Islamabad",
    since: 2020,
    verified: false,
    verification: "Verification in progress",
    tagline: "Chargers, cables and audio we test before listing.",
    dispatchDays: "1–2 days",
    deliveryFee: 199,
    freeDeliveryOver: 4000,
    returnPolicy: "7-day return; 6-month seller warranty on electronics",
  },
  {
    slug: "ghar-craft",
    name: "Ghar Craft",
    city: "Multan",
    since: 2018,
    verified: true,
    verification: "Business registration and return address checked by HomeBEZ",
    tagline: "Handmade ceramics, brass and cotton for the home.",
    dispatchDays: "2–4 days",
    deliveryFee: 299,
    returnPolicy: "Damaged-on-arrival replacement within 48 hours",
  },
];

const sizes = (unavailable: string[] = []): ProductOption => ({
  name: "Size",
  values: ["XS", "S", "M", "L", "XL"].map((s) => ({
    label: s,
    available: !unavailable.includes(s),
    reason: unavailable.includes(s) ? "Sold out at this store" : undefined,
  })),
});

export const products: Product[] = [
  {
    slug: "printed-lawn-3pc-suit",
    title: "Printed Lawn 3-Piece Unstitched Suit with Chiffon Dupatta",
    brand: "Noor",
    category: "fashion",
    store: "noor-textiles",
    price: 4490,
    compareAt: 5990,
    rating: 4.6,
    reviewCount: 128,
    stock: 14,
    art: "dress",
    tone: "#E9D8C4",
    options: [
      {
        name: "Colour",
        values: [
          { label: "Sage", swatch: "#9DB09A", available: true },
          { label: "Rose", swatch: "#D8A1A4", available: true },
          { label: "Ivory", swatch: "#EDE6D6", available: false, reason: "Sold out — restock not scheduled" },
        ],
      },
    ],
    highlights: ["Shirt 3 m digital-printed lawn", "Dupatta 2.5 m chiffon", "Trouser 2.5 m dyed cambric"],
    description:
      "A breathable everyday lawn set for warm months. Colours are photographed in daylight; expect slight variation between screens.",
    tags: ["lawn", "suit", "unstitched", "kapray"],
    createdRank: 3,
  },
  {
    slug: "cotton-kurta-men",
    title: "Men's Cotton Kurta, Regular Fit",
    brand: "Noor",
    category: "fashion",
    store: "noor-textiles",
    price: 2490,
    rating: 4.3,
    reviewCount: 54,
    stock: 22,
    art: "shirt",
    tone: "#D6DEE6",
    options: [
      {
        name: "Colour",
        values: [
          { label: "White", swatch: "#F4F4F0", available: true },
          { label: "Navy", swatch: "#2A3550", available: true },
        ],
      },
      sizes(["XS", "XL"]),
    ],
    highlights: ["100% cotton", "Side pockets", "Machine wash cold"],
    description: "Soft combed cotton kurta with a straight hem and button placket.",
    tags: ["kurta", "men", "cotton", "shalwar"],
    createdRank: 8,
  },
  {
    slug: "leather-khussa",
    title: "Handmade Leather Khussa with Embroidery",
    brand: "Noor",
    category: "fashion",
    store: "noor-textiles",
    price: 3200,
    stock: 3,
    art: "shoe",
    tone: "#E6D2B5",
    options: [
      {
        name: "Size",
        values: ["37", "38", "39", "40", "41"].map((s) => ({
          label: s,
          available: s !== "41",
          reason: s === "41" ? "Sold out at this store" : undefined,
        })),
      },
    ],
    highlights: ["Genuine leather sole", "Hand embroidery", "Runs half a size small"],
    description: "Traditional khussa stitched by hand in Multan.",
    tags: ["khussa", "shoes", "footwear"],
    createdRank: 1,
  },
  {
    slug: "canvas-tote",
    title: "Everyday Canvas Tote with Zip Pocket",
    brand: "Noor",
    category: "fashion",
    store: "noor-textiles",
    price: 1290,
    compareAt: 1590,
    rating: 4.1,
    reviewCount: 19,
    stock: 40,
    art: "bag",
    tone: "#DCD5C3",
    options: [],
    highlights: ["Heavy cotton canvas", "Inner zip pocket", "Fits a 14-inch laptop"],
    description: "A sturdy tote for daily errands and work.",
    tags: ["bag", "tote"],
    createdRank: 11,
  },
  {
    slug: "oud-attar-12ml",
    title: "Oud Al Layl Attar, Alcohol-Free",
    brand: "Attar House",
    category: "beauty",
    store: "attar-house",
    price: 2490,
    rating: 4.8,
    reviewCount: 312,
    stock: 9,
    art: "perfume",
    tone: "#E8D3A6",
    options: [
      {
        name: "Volume",
        values: [
          { label: "6 ml", available: true },
          { label: "12 ml", available: true },
          { label: "24 ml", available: false, reason: "Not produced this batch" },
        ],
      },
    ],
    highlights: ["Notes: oud, amber, rose", "Alcohol-free oil base", "Roll-on bottle"],
    description: "A deep evening attar blended in small batches. Patch-test before regular use.",
    tags: ["attar", "oud", "perfume", "khushbu"],
    createdRank: 2,
  },
  {
    slug: "rose-edp-50",
    title: "Gulab Eau de Parfum 50 ml",
    brand: "Attar House",
    category: "beauty",
    store: "attar-house",
    price: 3990,
    compareAt: 4590,
    rating: 4.5,
    reviewCount: 87,
    stock: 18,
    art: "perfume",
    tone: "#F0D1D3",
    options: [],
    highlights: ["Notes: Taif rose, musk", "Long-lasting EDP", "Glass spray bottle"],
    description: "Fresh rose with a soft musk base.",
    tags: ["perfume", "rose", "edp"],
    createdRank: 6,
  },
  {
    slug: "matte-lip-set",
    title: "Matte Lip Colour Set of 4 Shades",
    brand: "Rang",
    category: "beauty",
    store: "attar-house",
    price: 1850,
    stock: 0,
    art: "lipstick",
    tone: "#E7C0BC",
    options: [],
    highlights: ["Four everyday shades", "Transfer-resistant", "Vitamin E"],
    description: "A starter set of matte liquid lipsticks.",
    tags: ["lipstick", "makeup"],
    createdRank: 14,
  },
  {
    slug: "kundan-jhumka",
    title: "Kundan Jhumka Earrings, Gold-Plated",
    brand: "Zevar",
    category: "jewellery",
    store: "zevar-studio",
    price: 2190,
    compareAt: 2790,
    rating: 4.4,
    reviewCount: 61,
    stock: 12,
    art: "ring",
    tone: "#EFDCAE",
    options: [],
    highlights: ["Brass base, 18k gold plating", "Push-back closure", "Weight 14 g per pair"],
    description: "Occasion jhumkas with kundan stones and pearl drops.",
    tags: ["jhumka", "earrings", "kundan"],
    createdRank: 4,
  },
  {
    slug: "silver-band-ring",
    title: "925 Sterling Silver Band Ring",
    brand: "Zevar",
    category: "jewellery",
    store: "zevar-studio",
    price: 3450,
    rating: 4.7,
    reviewCount: 23,
    stock: 6,
    art: "ring",
    tone: "#E2E4E6",
    options: [
      {
        name: "Size",
        values: ["6", "7", "8", "9"].map((s) => ({
          label: s,
          available: s !== "9",
          reason: s === "9" ? "Made to order — not available yet" : undefined,
        })),
      },
    ],
    highlights: ["Hallmarked 925 silver", "Brushed finish", "Ring sizer guide included"],
    description: "A minimal band for daily wear.",
    tags: ["ring", "silver"],
    createdRank: 9,
  },
  {
    slug: "minimal-watch",
    title: "Minimal Analogue Watch with Mesh Strap",
    brand: "Zevar",
    category: "jewellery",
    store: "zevar-studio",
    price: 5990,
    compareAt: 7490,
    rating: 4.2,
    reviewCount: 38,
    stock: 7,
    art: "watch",
    tone: "#DDD8CF",
    options: [
      {
        name: "Colour",
        values: [
          { label: "Gold", swatch: "#C9A24A", available: true },
          { label: "Silver", swatch: "#BFC3C7", available: true },
          { label: "Black", swatch: "#2B2B2B", available: true },
        ],
      },
    ],
    highlights: ["Japanese quartz movement", "Stainless steel mesh", "3 ATM splash resistant"],
    description: "A slim everyday watch.",
    warranty: "1-year seller warranty on movement",
    tags: ["watch", "ghari"],
    createdRank: 7,
  },
  {
    slug: "sunglasses-uv400",
    title: "Polarised UV400 Sunglasses",
    brand: "Zevar",
    category: "jewellery",
    store: "zevar-studio",
    price: 1690,
    stock: 25,
    art: "glasses",
    tone: "#D9D2C2",
    options: [],
    highlights: ["UV400 lenses", "Hard case included"],
    description: "Lightweight frames for daily wear.",
    tags: ["sunglasses", "chashma"],
    createdRank: 15,
  },
  {
    slug: "anc-earbuds",
    title: "Wireless Earbuds with Active Noise Cancellation",
    brand: "Volt",
    category: "electronics",
    store: "volt-lane",
    price: 7990,
    compareAt: 9990,
    rating: 4.3,
    reviewCount: 204,
    stock: 4,
    art: "headphones",
    tone: "#D3DAE0",
    options: [
      {
        name: "Colour",
        values: [
          { label: "Black", swatch: "#232323", available: true },
          { label: "White", swatch: "#F2F2F2", available: false, reason: "Sold out — next batch expected" },
        ],
      },
    ],
    highlights: ["Up to 28 h with case", "USB-C charging", "Bluetooth 5.3"],
    description: "Earbuds with hybrid ANC and transparency mode.",
    warranty: "6-month seller warranty",
    tags: ["earbuds", "headphones", "audio"],
    createdRank: 5,
  },
  {
    slug: "usb-c-fast-charger",
    title: "30W USB-C Fast Charger with 1 m Cable",
    brand: "Volt",
    category: "electronics",
    store: "volt-lane",
    price: 2290,
    rating: 4.5,
    reviewCount: 412,
    stock: 60,
    art: "cable",
    tone: "#E1E3E0",
    options: [],
    highlights: ["PD 3.0", "Compatible with most USB-C phones", "Over-heat protection"],
    description: "Compact wall charger tested by the seller before listing.",
    warranty: "6-month seller warranty",
    tags: ["charger", "usb-c", "cable"],
    createdRank: 10,
  },
  {
    slug: "bt-speaker",
    title: "Portable Bluetooth Speaker, Splash-Resistant",
    brand: "Volt",
    category: "electronics",
    store: "volt-lane",
    price: 4990,
    stock: 11,
    art: "speaker",
    tone: "#D7DCD3",
    options: [],
    highlights: ["12 h playback", "IPX5", "Built-in mic"],
    description: "A small speaker for rooms and outdoors.",
    warranty: "6-month seller warranty",
    tags: ["speaker", "audio"],
    createdRank: 12,
  },
  {
    slug: "brass-table-lamp",
    title: "Hand-Finished Brass Table Lamp with Linen Shade",
    brand: "Ghar Craft",
    category: "home",
    store: "ghar-craft",
    price: 8990,
    compareAt: 10990,
    rating: 4.9,
    reviewCount: 41,
    stock: 2,
    art: "lamp",
    tone: "#ECDDBF",
    options: [],
    highlights: ["Solid brass base", "E27 bulb (not included)", "Height 46 cm"],
    description: "Each base is finished by hand, so small marks are part of the piece.",
    tags: ["lamp", "brass", "lighting"],
    createdRank: 13,
  },
  {
    slug: "blue-pottery-mugs",
    title: "Multani Blue Pottery Mugs, Set of 2",
    brand: "Ghar Craft",
    category: "home",
    store: "ghar-craft",
    price: 2790,
    rating: 4.6,
    reviewCount: 33,
    stock: 15,
    art: "cup",
    tone: "#CFDDEA",
    options: [],
    highlights: ["Hand-painted", "Food safe glaze", "Not microwave safe"],
    description: "Traditional Multani blue pottery for everyday tea.",
    tags: ["mugs", "pottery", "kitchen"],
    createdRank: 16,
  },
  {
    slug: "cotton-bedsheet-king",
    title: "Percale Cotton Bedsheet Set, King",
    brand: "Ghar Craft",
    category: "home",
    store: "ghar-craft",
    price: 5490,
    compareAt: 6490,
    rating: 4.4,
    reviewCount: 72,
    stock: 20,
    art: "bed",
    tone: "#E5E0D6",
    options: [
      {
        name: "Colour",
        values: [
          { label: "Ivory", swatch: "#EFE9DC", available: true },
          { label: "Sage", swatch: "#A9B8A2", available: true },
          { label: "Charcoal", swatch: "#3A3B38", available: true },
        ],
      },
    ],
    highlights: ["200 thread count", "1 sheet + 2 pillow covers", "Pre-washed"],
    description: "Crisp, cool percale weave for warm nights.",
    tags: ["bedsheet", "chadar", "linen"],
    createdRank: 17,
  },
  {
    slug: "accent-armchair",
    title: "Accent Armchair with Sheesham Legs",
    brand: "Ghar Craft",
    category: "home",
    store: "ghar-craft",
    price: 32500,
    stock: 1,
    art: "sofa",
    tone: "#E2D3BE",
    options: [],
    highlights: ["Solid sheesham legs", "Removable cover", "Delivered assembled in Multan, Lahore"],
    description: "A compact reading chair. Delivery limited to selected cities.",
    tags: ["chair", "furniture"],
    createdRank: 18,
  },
];

export const budgets = [
  { label: "Under Rs. 1,500", max: 1500 },
  { label: "Under Rs. 3,000", max: 3000 },
  { label: "Under Rs. 5,000", max: 5000 },
  { label: "Gifts under Rs. 10,000", max: 10000 },
];

export const deliveryCities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];

export function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getStore(slug: string) {
  return stores.find((s) => s.slug === slug)!;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function discountPercent(p: Pick<Product, "price" | "compareAt">) {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

export type SortKey = "relevance" | "price-asc" | "price-desc" | "newest" | "rating";

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
const synonyms: Record<string, string> = {
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

export function searchProducts(params: SearchParams) {
  const raw = (params.q ?? "").trim().toLowerCase();
  const terms = raw
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => synonyms[t] ?? t);
  const min = params.min ? Number(params.min) : undefined;
  const max = params.max ? Number(params.max) : undefined;

  let list = products.filter((p) => {
    if (params.category && p.category !== params.category) return false;
    if (params.store && p.store !== params.store) return false;
    if (min !== undefined && p.price < min) return false;
    if (max !== undefined && p.price > max) return false;
    if (params.instock === "1" && p.stock === 0) return false;
    if (!terms.length) return true;
    const hay = [p.title, p.brand, getCategory(p.category)?.name, getStore(p.store).name, ...p.tags]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  const sort = (params.sort ?? "relevance") as SortKey;
  list = [...list];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "newest") list.sort((a, b) => a.createdRank - b.createdRank);
  if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return list;
}

export function suggest(query: string, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const mapped = synonyms[q] ?? q;
  return products
    .filter((p) => (p.title + " " + p.tags.join(" ")).toLowerCase().includes(mapped))
    .slice(0, limit);
}
