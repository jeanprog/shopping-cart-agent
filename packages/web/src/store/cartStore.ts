import { create } from "zustand";
import {
  addCartItemRequest,
  completeCartPurchaseRequest,
  fetchCartRequest,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../services/cartApi";

export interface CartItem {
  id: string;
  quantity: number;
  productName: string;
  /** Preço unitário em centavos */
  productPrice: number;
  productId: string;
  imageUrl?: string | null;
  brand?: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  cartId?: string;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  fetchCart: (token: string) => Promise<void>;
  /** POST /api/cart/items — adiciona ao carrinho e atualiza a lista */
  addToCart: (
    token: string,
    productId: string,
    quantity?: number,
  ) => Promise<{ success?: boolean; error?: string }>;
  updateItemQuantity: (
    token: string,
    itemId: string,
    quantity: number,
  ) => Promise<{ success?: boolean; error?: string }>;
  removeItem: (
    token: string,
    itemId: string,
  ) => Promise<{ success?: boolean; error?: string }>;
  completePurchase: (
    token: string,
    addressId?: string | null,
  ) => Promise<{ success?: boolean; error?: string; message?: string }>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  cartId: undefined,
  isLoading: false,
  isOpen: false,
  error: null,

  fetchCart: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchCartRequest(token);
      if (data.success) {
        set({
          items: data.items || [],
          total: data.total || 0,
          cartId: data.cartId,
          isLoading: false,
        });
      } else {
        set({
          error: data.error || "Erro ao carregar o carrinho",
          isLoading: false,
        });
      }
    } catch {
      set({ error: "Erro de conexão ao buscar carrinho", isLoading: false });
    }
  },

  addToCart: async (token, productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const data = await addCartItemRequest(token, productId, quantity);
      if (data.success) {
        await get().fetchCart(token);
      } else {
        set({ error: data.error || "Não foi possível adicionar" });
      }
      set({ isLoading: false });
      return data;
    } catch {
      set({
        error: "Erro de conexão ao adicionar ao carrinho",
        isLoading: false,
      });
      return { success: false };
    }
  },

  updateItemQuantity: async (token, itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const data = await updateCartItemRequest(token, itemId, quantity);
      if (data.success) {
        await get().fetchCart(token);
      } else {
        set({ error: data.error || "Não foi possível atualizar" });
      }
      set({ isLoading: false });
      return data;
    } catch {
      set({
        error: "Erro de conexão ao atualizar item",
        isLoading: false,
      });
      return { success: false };
    }
  },

  removeItem: async (token, itemId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await removeCartItemRequest(token, itemId);
      if (data.success) {
        await get().fetchCart(token);
      } else {
        set({ error: data.error || "Não foi possível remover" });
      }
      set({ isLoading: false });
      return data;
    } catch {
      set({
        error: "Erro de conexão ao remover item",
        isLoading: false,
      });
      return { success: false };
    }
  },

  completePurchase: async (token, addressId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await completeCartPurchaseRequest(token, addressId);
      if (data.success) {
        await get().fetchCart(token);
      } else {
        set({ error: data.error || "Não foi possível finalizar" });
      }
      set({ isLoading: false });
      return data;
    } catch {
      set({
        error: "Erro de conexão ao finalizar",
        isLoading: false,
      });
      return { success: false };
    }
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
