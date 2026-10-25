import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignUpForm } from "../login/AuthForms";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="container-hb flex justify-center py-10">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6">
        <h1 className="text-[26px] font-bold leading-[34px]">Create account</h1>
        <p className="mb-5 mt-1 text-sm text-ink-secondary">
          Save your details and see your orders. You can also check out as a guest without an account.
        </p>
        <SignUpForm next={next} />
      </div>
    </div>
  );
}
