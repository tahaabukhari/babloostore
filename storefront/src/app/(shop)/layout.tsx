import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

// Every shop page reads live data from the database.
export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
