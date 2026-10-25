import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignUpForm } from "../login/AuthForms";

export const metadata: Metadata = { title: "Open your store" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="container-hb flex justify-center py-10">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <h1 className="text-[26px] font-bold leading-[34px]">Open your store</h1>
        <p className="mb-5 mt-1 text-sm text-ink-secondary">
          Create your account and store in one step. You&apos;ll add delivery details and products next.
        </p>
        <SignUpForm invite={code} />
      </div>
    </div>
  );
}
