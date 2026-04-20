import type { ChatCompletionMessage } from "@/domain/shoppingChat";
import type { ChatProductPreview } from "@/types/chat";
import { api } from "./api";

export type ShoppingChatResponse = {
  response: string;
  products?: ChatProductPreview[];
};

export async function sendShoppingChatMessage(
  token: string,
  messages: ChatCompletionMessage[],
): Promise<ShoppingChatResponse> {
  return api.post<ShoppingChatResponse>(
    "/api/chat",
    { messages },
    token,
  );
}
