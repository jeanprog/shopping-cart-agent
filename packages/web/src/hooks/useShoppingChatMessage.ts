import { useCallback } from "react";
import { buildShoppingChatCompletionMessages } from "@/domain/shoppingChat";
import { useChatStore, type Message } from "../store/chatStore";
import { useCartStore } from "../store/cartStore";
import { sendShoppingChatMessage } from "../services/chatApi";

/**
 * Orquestra envio ao assistente: histórico → API → mensagem assistente + refresh do carrinho.
 * Chamadas HTTP ficam em {@link sendShoppingChatMessage}; a página só dispara o fluxo.
 */
export function useShoppingChatMessage() {
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const token = useChatStore((s) => s.token);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const sendUserText = useCallback(
    async (userMessage: string, messagesBeforeUser: Message[]) => {
      if (!userMessage.trim() || !token) return;

      addMessage(userMessage.trim(), "user");
      setLoading(true);

      try {
        const payload = buildShoppingChatCompletionMessages(
          messagesBeforeUser,
          userMessage,
        );
        const data = await sendShoppingChatMessage(token, payload);

        if (data.response) {
          addMessage(data.response, "assistant", data.products);
          void fetchCart(token);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        addMessage(
          "Erro ao obter resposta da IA. Verifique o servidor.",
          "assistant",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, addMessage, setLoading, fetchCart],
  );

  return { sendUserText };
}
