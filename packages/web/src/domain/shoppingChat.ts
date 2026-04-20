import type { Message } from "@/store/chatStore";

export type ChatCompletionMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Monta o payload de mensagens para POST /api/chat (histórico + última do usuário).
 */
export function buildShoppingChatCompletionMessages(
  messagesBeforeUser: readonly Message[],
  userText: string,
): ChatCompletionMessage[] {
  const trimmed = userText.trim();
  const history: ChatCompletionMessage[] = messagesBeforeUser.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  history.push({ role: "user", content: trimmed });
  return history;
}
