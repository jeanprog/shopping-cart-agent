import type { SettingsAddressFormValues } from "@/schemas/settingsAddressForm";

/** Corpo para POST /api/addresses a partir do formulário validado (modal config). */
export function toSettingsCreateAddressBody(
  data: SettingsAddressFormValues,
  isFirstAddress: boolean,
): {
  label: string;
  cep?: string;
  street: string;
  number: string;
  complement?: string;
  district?: string;
  city: string;
  state: string;
  isDefault: boolean;
} {
  return {
    label: data.label.trim(),
    cep: data.cep.trim() || undefined,
    street: data.street.trim(),
    number: data.number.trim(),
    complement: data.complement.trim() || undefined,
    district: data.district.trim() || undefined,
    city: data.city.trim(),
    state: data.state.trim().slice(0, 2).toUpperCase(),
    isDefault: isFirstAddress,
  };
}
