export const FREE_SHIPPING_THRESHOLD = 299;
export const STANDARD_SHIPPING_FEE = 39;

export function calculateShippingFee(cartTotal) {
  if (!cartTotal || cartTotal <= 0) return 0;

  return cartTotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : STANDARD_SHIPPING_FEE;
}

