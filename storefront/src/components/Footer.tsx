import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

const columns = [
  {
    title: "Shop",
    links: categories.map((c) => ({ label: c.name, href: `/search?category=${c.slug}` })),
  },
  {
    title: "Help",
    links: [
      { label: "Track your order", href: "#" },
      { label: "Returns and refunds", href: "#" },
      { label: "Delivery coverage", href: "#" },
      { label: "Contact support", href: "#" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "What 'Verified store' means", href: "#" },
      { label: "Terms of use", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Prohibited items", href: "#" },
    ],
  },
  {
    title: "Sell on BablooStore",
    links: [
      { label: "Open your store (invite only)", href: "/signup" },
      { label: "Store owner sign in", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-dark mt-16 bg-ink pb-20 text-white/80 sm:pb-0">
      <div className="container-hb grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Image src="/brand/homebez-symbol.png" alt="" width={40} height={40} className="size-10" />
            <Image src="/brand/homebez-wordmark.png" alt="BablooStore" width={568} height={96} className="h-6 w-auto" />
          </div>
          <p className="mt-3 text-sm">Everything you need, from approved Pakistani stores.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-bold text-white">{col.title}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="inline-flex min-h-8 items-center hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-hb flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            Payment options: Cash on delivery · Card and wallet payments (pending provider approval). Prices in PKR.
          </p>
          <p>© 2026 BablooStore · Design prototype</p>
        </div>
      </div>
    </footer>
  );
}
