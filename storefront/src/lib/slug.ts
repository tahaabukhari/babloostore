import { randomBytes } from "node:crypto";

export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

/** Slug with a short random suffix so two products with the same title never collide. */
export function uniqueSlug(text: string) {
  return `${slugify(text)}-${randomBytes(3).toString("hex")}`;
}

/** Human-friendly order number, e.g. BS-7K2Q9M (no 0/O/1/I). */
export function orderNumber() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  return "BS-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
