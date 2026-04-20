import { Router } from "express";
import { authenticate, type AuthRequest } from "../auth";
import {
  getOrderForUser,
  listOrdersByUser,
  serializeOrderDetail,
  serializeOrderListItem,
} from "../services/orders";
import { paramAsString } from "../http/param";

export const ordersRouter = Router();

ordersRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const rows = await listOrdersByUser(req.userId!);
    res.json({
      success: true,
      orders: rows.map(serializeOrderListItem),
    });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, error: "Erro ao listar pedidos" });
  }
});

ordersRouter.get("/:orderId", authenticate, async (req: AuthRequest, res) => {
  try {
    const orderId = paramAsString(req.params.orderId);
    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId obrigatório" });
    }
    const d = await getOrderForUser(req.userId!, orderId);
    if (!d) {
      return res
        .status(404)
        .json({ success: false, error: "Pedido não encontrado" });
    }
    res.json({
      success: true,
      order: serializeOrderDetail(d.order, d.lines),
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, error: "Erro ao carregar pedido" });
  }
});
