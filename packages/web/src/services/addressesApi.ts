import { api } from "./api";

export type UserAddressDto = {
  id: string;
  userId: string;
  label: string;
  cep: string | null;
  street: string;
  number: string;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  isDefault: boolean;
  deliveryPreference: "fast" | "economic";
  notifyOrderUpdates: boolean;
  notifyPromos: boolean;
  createdAt: string;
};

export async function fetchAddresses(token: string): Promise<UserAddressDto[]> {
  const data = await api.get<{
    success: boolean;
    addresses?: UserAddressDto[];
  }>("/api/addresses", token);
  if (!data.success || !data.addresses) return [];
  return data.addresses;
}

export async function createAddress(
  token: string,
  body: {
    label: string;
    cep?: string;
    street: string;
    number: string;
    complement?: string;
    district?: string;
    city: string;
    state: string;
    isDefault?: boolean;
    deliveryPreference?: "fast" | "economic";
    notifyOrderUpdates?: boolean;
    notifyPromos?: boolean;
    finalizeOnboarding?: boolean;
  },
): Promise<UserAddressDto> {
  const data = await api.post<{
    success: boolean;
    address?: UserAddressDto;
    error?: string;
  }>("/api/addresses", body, token);
  if (!data.success || !data.address) {
    throw new Error(data.error ?? "Erro ao salvar endereço");
  }
  return data.address;
}

export async function deleteAddressApi(
  token: string,
  addressId: string,
): Promise<void> {
  const data = await api.delete<{ success: boolean; error?: string }>(
    `/api/addresses/${encodeURIComponent(addressId)}`,
    token,
  );
  if (!data.success) throw new Error(data.error ?? "Erro ao remover");
}

export async function setDefaultAddressApi(
  token: string,
  addressId: string,
): Promise<void> {
  const data = await api.post<{ success: boolean; error?: string }>(
    `/api/addresses/${encodeURIComponent(addressId)}/default`,
    {},
    token,
  );
  if (!data.success) throw new Error(data.error ?? "Erro ao definir padrão");
}
