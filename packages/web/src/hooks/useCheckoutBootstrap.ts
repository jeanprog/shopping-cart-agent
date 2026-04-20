import { useEffect, useMemo, useState } from "react";
import type { UserAddressDto } from "@/services/addressesApi";
import { fetchAddresses } from "@/services/addressesApi";
import {
  fetchCheckoutDefaults,
  type CheckoutDefaults,
} from "@/services/ordersApi";
import {
  buildCheckoutAddressDisplay,
  resolveCheckoutAddressId,
} from "@/domain/checkoutSelection";

/**
 * Carrega defaults de checkout + endereços e mantém seleção (estado de UI).
 */
export function useCheckoutBootstrap(token: string) {
  const [loading, setLoading] = useState(true);
  const [defaults, setDefaults] = useState<CheckoutDefaults | null>(null);
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([fetchCheckoutDefaults(token), fetchAddresses(token)])
      .then(([d, list]) => {
        if (cancelled) return;
        setDefaults(d);
        setAddresses(list);
        setSelectedAddressId(resolveCheckoutAddressId(d, list));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const addressDisplay = useMemo(
    () =>
      buildCheckoutAddressDisplay(selectedAddressId, addresses, defaults),
    [selectedAddressId, addresses, defaults],
  );

  const shippingCents = defaults?.shippingCents ?? 0;

  return {
    bootstrapLoading: loading,
    defaults,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addressDisplay,
    shippingCents,
  };
}
