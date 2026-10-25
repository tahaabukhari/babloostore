// Shared by cart (preview) and checkout (authoritative) so totals always match.
export function deliveryFee(store: { deliveryFee: number; freeDeliveryOver: number | null }, subtotal: number) {
  return store.freeDeliveryOver != null && subtotal >= store.freeDeliveryOver ? 0 : store.deliveryFee;
}
