import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";

// Every shop page reads live data from the database.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <div className="bg-gold-soft text-center text-xs leading-6 text-gold-ink">
        Testing build — accounts and orders are for testing only. Payment is cash on delivery.
      </div>
      <Header user={user ? { name: user.name, isOwner: user.role !== "customer" } : null} />
      <main id="main" className="pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
