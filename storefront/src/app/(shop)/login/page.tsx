import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "./AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return (
    <div className="container-hb flex justify-center py-10">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6">
        <h1 className="text-[26px] font-bold leading-[34px]">Sign in</h1>
        <p className="mb-5 mt-1 text-sm text-ink-secondary">Shoppers and store owners sign in here.</p>
        <SignInForm next={next} />
      </div>
    </div>
  );
}
