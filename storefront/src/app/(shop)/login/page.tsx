import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "./AuthForms";

export const metadata: Metadata = { title: "Store owner sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; denied?: string }> }) {
  const { next, denied } = await searchParams;
  const user = await getCurrentUser();
  if (user && !denied) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
  return (
    <div className="container-hb flex justify-center py-10">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6">
        <h1 className="text-[26px] font-bold leading-[34px]">Store owner sign in</h1>
        <p className="mb-5 mt-1 text-sm text-ink-secondary">Shoppers don&apos;t need an account — just add to cart and check out.</p>
        {denied && (
          <p role="alert" className="mb-4 rounded-card border border-gold bg-gold-soft p-3 text-sm">
            This account doesn&apos;t have a store. Sign in with your store owner account.
          </p>
        )}
        <SignInForm next={next} />
      </div>
    </div>
  );
}
