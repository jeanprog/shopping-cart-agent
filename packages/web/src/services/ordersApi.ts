import { api } from "./api";
import type { OrderDetailDto, OrderListItemDto } from "../types/order";

export async function fetchOrdersList(token: string): Promise<OrderListItemDto[]> {
  const data = await api.get<{
    success: boolean;
    orders?: OrderListItemDto[];
  }>("/api/orders", token);
  if (!data.success || !data.orders) return [];
  return data.orders;
}

export async function fetchOrderDetail(
  token: string,
  orderId: string,
): Promise<OrderDetailDto | null> {
  const data = await api.get<{
    success: boolean;
    order?: OrderDetailDto;
  }>(`/api/orders/${encodeURIComponent(orderId)}`, token);
  if (!data.success || !data.order) return null;
  return data.order;
}

export type CheckoutDefaults = {
  addressTitle: string;
  addressLines: string;
  shippingCents: number;
  addressId: string | null;
};

export async function fetchCheckoutDefaults(
  token: string,
): Promise<CheckoutDefaults | null> {
  const data = await api.get<{
    success: boolean;
    addressTitle?: string;
    addressLines?: string;
    shippingCents?: number;
    addressId?: string | null;
  }>("/api/checkout/defaults", token);
  if (!data.success) return null;
  return {
    addressTitle: data.addressTitle ?? "",
    addressLines: data.addressLines ?? "",
    shippingCents: data.shippingCents ?? 0,
    addressId: data.addressId ?? null,
  };
}
