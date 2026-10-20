import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/Toast";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

// next/font self-hosts these as WOFF2 with font-display: swap.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "HomeBEZ — Everything you need, all in one place", template: "%s · HomeBEZ" },
  description: "Curated Pakistani marketplace: fashion, beauty, jewellery, electronic accessories and home.",
};

export const viewport: Viewport = {
  themeColor: "#191A18",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded-control bg-gold px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <CartProvider>
          <ToastProvider>
            <div className="bg-gold-soft text-center text-xs leading-6 text-gold-ink">
              Design prototype — prices, stock, stores and reviews are illustrative.
            </div>
            <Header />
            <main id="main" className="pb-16 sm:pb-0">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
