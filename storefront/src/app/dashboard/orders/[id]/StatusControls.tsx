"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { useToast } from "@/components/Toast";
import { Button, statusMap, type OrderStatus } from "@/components/ui";

const verbs: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm order",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

export function StatusControls({ orderId, next }: { orderId: string; next: OrderStatus[] }) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string>();
  const toast = useToast();

  if (!next.length) return <p className="text-sm text-ink-secondary">This order is closed; no further changes.</p>;

  function run(s: OrderStatus) {
    if (s === "cancelled" && !confirm("Cancel this order? Its items go back into stock.")) return;
    setBusy(s);
    setError(undefined);
    start(async () => {
      const res = await updateOrderStatus(orderId, s);
      if (res.error) setError(res.error);
      else toast({ tone: "success", message: `Order marked ${statusMap[s].label.toLowerCase()}.` });
      setBusy(null);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <Button
            key={s}
            variant={s === "cancelled" ? "danger" : "primary"}
            onClick={() => run(s)}
            loading={pending && busy === s}
            disabled={pending}
          >
            {verbs[s]}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
