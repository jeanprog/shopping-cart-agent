import { shoppingTools, shoppingToolsDeclaration } from "./shopping-tools";
import { products } from "../db/schema";

type ProductRow = typeof products.$inferSelect;

/** Produtos retornados ao front para o carrossel do chat (JSON). */
export interface ChatProductPreview {
  id: string;
  name: string;
  brand: string | null;
  priceCents: number;
  imageUrl: string | null;
}

export interface ChatAgentResult {
  text: string;
  products: ChatProductPreview[];
}

function mapProductsToPreview(
  map: Map<string, ProductRow>,
): ChatProductPreview[] {
  return [...map.values()].slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand ?? null,
    priceCents: p.price,
    imageUrl: p.imageUrl ?? null,
  }));
}

/** Texto exibido no chat quando há cards — evita repetir lista no markdown. */
const MSG_WITH_PRODUCT_CARDS =
  "Aqui estão os produtos abaixo. Os detalhes estão nos cards — role a lista para o lado para ver todos.";

function finalizeAssistantText(
  raw: string | null | undefined,
  products: ChatProductPreview[],
): string {
  if (products.length > 0) {
    return MSG_WITH_PRODUCT_CARDS;
  }
  return (raw ?? "").trim();
}

const SYSTEM_SHOPAI = `Você é o assistente ShopAI. Regras importantes:
- Quando a ferramenta search_products retornar itens, a interface mostrará os produtos em CARDS abaixo da sua mensagem. NÃO liste produtos, preços nem tabelas no texto — diga só que estão abaixo nos cards (uma frase curta).
- Para carrinho e checkout, use as ferramentas get_cart, add_to_cart e complete_purchase quando fizer sentido.`;

// Correção para erro de certificado SSL em ambiente local
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

function isRetryableFetchError(e: unknown): boolean {
  const err = e as Error & { cause?: { code?: string } };
  const code = err?.cause?.code ?? (e as NodeJS.ErrnoException)?.code;
  const msg = String(e);
  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "UND_ERR_SOCKET" ||
    msg.includes("terminated") ||
    msg.includes("ECONNRESET") ||
    msg.includes("fetch failed")
  );
}

async function fetchOpenRouter(
  body: Record<string, unknown>,
  retries = 3,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Shopping Assistant",
        },
        body: JSON.stringify(body),
      });
      return res;
    } catch (e) {
      lastError = e;
      if (!isRetryableFetchError(e) || attempt === retries - 1) {
        throw e;
      }
      const wait = 800 * (attempt + 1);
      console.warn(
        `[OpenRouter] Conexão interrompida (${String((e as Error).message)}). Nova tentativa em ${wait}ms (${attempt + 1}/${retries})...`,
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

/** Aceita string JSON, objeto já parseado ou conteúdo inválido (modelo / filtro). */
function parseToolArguments(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string") return {};
  const s = raw.trim();
  if (!s) return {};
  try {
    const parsed = JSON.parse(s) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    console.warn(
      "[OpenRouter] arguments da ferramenta não são JSON válido; usando {}. Trecho:",
      s.slice(0, 160),
    );
    return {};
  }
}

export async function processOpenRouterShoppingMessage(
  userId: string,
  messages: any[],
): Promise<ChatAgentResult> {
  if (!OPENROUTER_API_KEY.trim()) {
    throw new Error(
      "OPENROUTER_API_KEY não configurada. Defina no .env da API.",
    );
  }

  const model = "openrouter/free";
  const toolsSetup = shoppingTools(userId);
  const toolsPayload = shoppingToolsDeclaration;

  type OpenRouterChatMessage =
    | { role: string; content?: string | null }
    | { role: "tool"; tool_call_id: string; content: string };

  // Histórico + instrução de sistema (evita lista duplicada quando há cards)
  let chatMessages: OpenRouterChatMessage[] = [
    { role: "system", content: SYSTEM_SHOPAI },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  let callCount = 0;
  const MAX_CALLS = 10;
  /** Produtos vistos nas buscas da IA (para o carrossel no chat). */
  const productById = new Map<string, ProductRow>();

  while (callCount < MAX_CALLS) {
    const response = await fetchOpenRouter({
      model: model,
      messages: chatMessages,
      tools: toolsPayload,
      tool_choice: "auto",
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter Error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Adiciona a resposta da IA ao histórico
    chatMessages.push(assistantMessage);

    // Se não houver chamadas de ferramentas, retornamos o texto final
    if (
      !assistantMessage.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      const products = mapProductsToPreview(productById);
      return {
        text: finalizeAssistantText(assistantMessage.content, products),
        products,
      };
    }

    // Processar chamadas de ferramentas
    for (const toolCall of assistantMessage.tool_calls) {
      const name = toolCall.function?.name ?? "";
      const args = parseToolArguments(toolCall.function?.arguments);

      console.log(`[OpenRouter] Executando ferramenta: ${name}`, args);

      //@ts-ignore
      const toolFunction = toolsSetup[name];
      let result;

      try {
        result = toolFunction
          ? await toolFunction(args)
          : { error: "Ferramenta não encontrada" };
      } catch (e) {
        result = {
          error: "Erro na execução da ferramenta",
          details: String(e),
        };
      }

      if (
        name === "search_products" &&
        result &&
        typeof result === "object" &&
        "success" in result &&
        (result as { success: boolean }).success &&
        Array.isArray((result as { products?: ProductRow[] }).products)
      ) {
        for (const p of (result as { products: ProductRow[] }).products) {
          productById.set(p.id, p);
        }
      }

      // Adiciona o resultado da ferramenta ao histórico
      chatMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    callCount++;
  }

  const products = mapProductsToPreview(productById);
  return {
    text: finalizeAssistantText(
      "Desculpe, excedi o limite de processamento. Tente novamente.",
      products,
    ),
    products,
  };
}
