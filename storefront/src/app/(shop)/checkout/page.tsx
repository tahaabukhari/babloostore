import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div className="container-hb py-4 lg:py-6">
      <h1 className="mb-4 text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-10">Checkout</h1>
      <CheckoutForm prefill={user ? { name: user.name, email: user.email } : null} />
    </div>
  );
}
