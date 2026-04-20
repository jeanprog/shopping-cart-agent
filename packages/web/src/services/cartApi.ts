import { api } from "./api";

/** Alinhado ao JSON de `GET /api/cart` (shoppingTools.get_cart). */
export type CartItemRow = {
  id: string;
  quantity: number;
  productName: string;
  productPrice: number;
  productId: string;
  imageUrl?: string | null;
  brand?: string | null;
};

export type CartGetResponse =
  | {
      success: true;
      items: CartItemRow[];
      total: number;
      cartId?: string;
      message?: string;
    }
  | { success: false; error?: string };

export type CartMutationResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function fetchCartRequest(token: string): Promise<CartGetResponse> {
  return api.get<CartGetResponse>("/api/cart", token);
}

export async function addCartItemRequest(
  token: string,
  productId: string,
  quantity: number,
): Promise<CartMutationResponse> {
  return api.post<CartMutationResponse>(
    "/api/cart/items",
    { productId, quantity },
    token,
  );
}

export async function updateCartItemRequest(
  token: string,
  itemId: string,
  quantity: number,
): Promise<CartMutationResponse> {
  return api.patch<CartMutationResponse>(
    `/api/cart/items/${encodeURIComponent(itemId)}`,
    { quantity },
    token,
  );
}

export async function removeCartItemRequest(
  token: string,
  itemId: string,
): Promise<CartMutationResponse> {
  return api.delete<CartMutationResponse>(
    `/api/cart/items/${encodeURIComponent(itemId)}`,
    token,
  );
}

export async function completeCartPurchaseRequest(
  token: string,
  addressId?: string | null,
): Promise<CartMutationResponse & { orderId?: string }> {
  return api.post<CartMutationResponse & { orderId?: string }>(
    "/api/cart/complete",
    addressId ? { addressId } : {},
    token,
  );
}
