import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="container-hb py-4 lg:py-6">
      <h1 className="mb-4 text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-10">Your cart</h1>
      <CartView />
    </div>
  );
}
