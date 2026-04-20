import type { UserAddressDto } from "@/services/addressesApi";
import type { CheckoutDefaults } from "@/services/ordersApi";
import { formatAddressPreviewLines } from "./addressFormat";

export function resolveCheckoutAddressId(
  defaults: CheckoutDefaults | null,
  addresses: readonly UserAddressDto[],
): string | null {
  return (
    defaults?.addressId ??
    addresses.find((a) => a.isDefault)?.id ??
    addresses[0]?.id ??
    null
  );
}

export type CheckoutAddressDisplay = {
  title: string;
  lines: string;
};

const FALLBACK_DISPLAY: CheckoutAddressDisplay = {
  title: "Casa - Principal",
  lines: "Rua das Flores, 123, Apto 45\nSão Paulo, SP - 01234-567",
};

export function buildCheckoutAddressDisplay(
  selectedAddressId: string | null,
  addresses: readonly UserAddressDto[],
  defaults: CheckoutDefaults | null,
): CheckoutAddressDisplay {
  if (selectedAddressId) {
    const a = addresses.find((x) => x.id === selectedAddressId);
    if (a) {
      return {
        title: a.label,
        lines: formatAddressPreviewLines(a),
      };
    }
  }
  if (defaults) {
    return {
      title: defaults.addressTitle,
      lines: defaults.addressLines,
    };
  }
  return FALLBACK_DISPLAY;
}
