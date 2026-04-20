import { Router } from "express";
import { authenticate, type AuthRequest } from "../auth";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "../services/addressService";
import { paramAsString } from "../http/param";

export const addressesRouter = Router();

addressesRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const rows = await listAddresses(req.userId!);
    res.json({ success: true, addresses: rows });
  } catch (error) {
    console.error("List addresses error:", error);
    res.status(500).json({ success: false, error: "Erro ao listar endereços" });
  }
});

addressesRouter.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const b = req.body ?? {};
    const result = await createAddress(req.userId!, {
      label: String(b.label ?? ""),
      cep: b.cep,
      street: String(b.street ?? ""),
      number: String(b.number ?? ""),
      complement: b.complement,
      district: b.district,
      city: String(b.city ?? ""),
      state: String(b.state ?? ""),
      isDefault: Boolean(b.isDefault),
      deliveryPreference:
        b.deliveryPreference === "fast" ? "fast" : "economic",
      notifyOrderUpdates:
        b.notifyOrderUpdates !== undefined
          ? Boolean(b.notifyOrderUpdates)
          : true,
      notifyPromos: Boolean(b.notifyPromos),
      finalizeOnboarding: Boolean(b.finalizeOnboarding),
    });
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, address: result.address });
  } catch (error) {
    console.error("Create address error:", error);
    res.status(500).json({ success: false, error: "Erro ao salvar endereço" });
  }
});

addressesRouter.patch(
  "/:addressId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const addressId = paramAsString(req.params.addressId);
      if (!addressId) {
        return res
          .status(400)
          .json({ success: false, error: "addressId obrigatório" });
      }
      const result = await updateAddress(req.userId!, addressId, req.body ?? {});
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.json({ success: true, address: result.address });
    } catch (error) {
      console.error("Update address error:", error);
      res
        .status(500)
        .json({ success: false, error: "Erro ao atualizar endereço" });
    }
  },
);

addressesRouter.delete(
  "/:addressId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const addressId = paramAsString(req.params.addressId);
      if (!addressId) {
        return res
          .status(400)
          .json({ success: false, error: "addressId obrigatório" });
      }
      const result = await deleteAddress(req.userId!, addressId);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete address error:", error);
      res
        .status(500)
        .json({ success: false, error: "Erro ao remover endereço" });
    }
  },
);

addressesRouter.post(
  "/:addressId/default",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const addressId = paramAsString(req.params.addressId);
      if (!addressId) {
        return res
          .status(400)
          .json({ success: false, error: "addressId obrigatório" });
      }
      const result = await setDefaultAddress(req.userId!, addressId);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({ success: false, error: "Erro ao definir padrão" });
    }
  },
);
