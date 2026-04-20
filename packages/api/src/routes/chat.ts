import { Router } from "express";
import { authenticate, type AuthRequest } from "../auth";
import { processOpenRouterShoppingMessage } from "../agent/openrouter-agent";

export const chatRouter = Router();

chatRouter.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Histórico de mensagens é obrigatório" });
    }

    const result = await processOpenRouterShoppingMessage(
      req.userId!,
      messages,
    );

    res.json({
      response: result.text,
      products: result.products,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Erro ao processar mensagem do chat" });
  }
});
