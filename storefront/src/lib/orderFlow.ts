import type { OrderStatus } from "@/db/schema";

// Allowed status moves for a store owner. Cancelling puts stock back.
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
