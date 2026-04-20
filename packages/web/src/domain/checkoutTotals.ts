/** Cálculos de checkout em centavos — puro TypeScript. */

export function sumCartItemQuantities(
  items: readonly { quantity: number }[],
): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function computeGrandTotalCents(input: {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
}): number {
  return input.subtotalCents + input.shippingCents - input.discountCents;
}

export function computeInstallmentCents(
  grandTotalCents: number,
  installments = 10,
): number {
  if (grandTotalCents <= 0) return 0;
  return Math.round(grandTotalCents / installments);
}
