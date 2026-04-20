import { Router } from "express";
import { authenticate, type AuthRequest } from "../auth";
import { shoppingTools } from "../agent/shopping-tools";
import { createOrderFromActiveCart } from "../services/orders";
import {
  formatAddressLines,
  getDefaultAddress,
} from "../services/addressService";
import { DEFAULT_SHIPPING } from "../constants/checkout";
import { paramAsString } from "../http/param";

export const cartRouter = Router();

cartRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const cart = await shoppingTools(req.userId!).get_cart();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar carrinho" });
  }
});

cartRouter.post("/items", authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || typeof productId !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "productId é obrigatório" });
    }
    const q = Math.max(1, Math.min(99, Number(quantity) || 1));
    const result = await shoppingTools(req.userId!).add_to_cart({
      productId,
      quantity: q,
    });
    res.json(result);
  } catch (error) {
    console.error("Add cart item error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar ao carrinho",
    });
  }
});

cartRouter.patch(
  "/items/:itemId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const itemId = paramAsString(req.params.itemId);
      const quantity = Number(req.body?.quantity);
      if (!itemId || !Number.isFinite(quantity)) {
        return res
          .status(400)
          .json({ success: false, error: "Dados inválidos" });
      }
      const result = await shoppingTools(req.userId!).update_cart_item(
        itemId,
        quantity,
      );
      res.json(result);
    } catch (error) {
      console.error("Update cart item error:", error);
      res
        .status(500)
        .json({ success: false, error: "Erro ao atualizar item" });
    }
  },
);

cartRouter.delete(
  "/items/:itemId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const itemId = paramAsString(req.params.itemId);
      if (!itemId) {
        return res
          .status(400)
          .json({ success: false, error: "itemId obrigatório" });
      }
      const result = await shoppingTools(req.userId!).remove_cart_item(itemId);
      res.json(result);
    } catch (error) {
      console.error("Remove cart item error:", error);
      res
        .status(500)
        .json({ success: false, error: "Erro ao remover item" });
    }
  },
);

cartRouter.post("/complete", authenticate, async (req: AuthRequest, res) => {
  try {
    const addressId =
      typeof req.body?.addressId === "string"
        ? req.body.addressId
        : undefined;
    const result = await createOrderFromActiveCart(req.userId!, {
      addressId,
    });
    res.json(result);
  } catch (error) {
    console.error("Complete purchase error:", error);
    res.status(500).json({ success: false, error: "Erro ao finalizar" });
  }
});

export const checkoutRouter = Router();

checkoutRouter.get("/defaults", authenticate, async (req: AuthRequest, res) => {
  try {
    const def = await getDefaultAddress(req.userId!);
    if (def) {
      return res.json({
        success: true,
        addressTitle: def.label,
        addressLines: formatAddressLines(def),
        shippingCents: 0,
        addressId: def.id,
      });
    }
    res.json({
      success: true,
      addressTitle: DEFAULT_SHIPPING.addressTitle,
      addressLines: DEFAULT_SHIPPING.addressLines,
      shippingCents: 0,
      addressId: null,
    });
  } catch (error) {
    console.error("Checkout defaults error:", error);
    res.status(500).json({ success: false, error: "Erro ao carregar checkout" });
  }
});
