import { db } from '../db/index';
import { products, carts, cartItems } from '../db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { createOrderFromActiveCart } from '../services/orders';

/**
 * Executa a busca de produtos de forma isolada para ser usada por ferramentas ou rotas diretas.
 */
/** Normaliza o que o modelo manda em search_products (string quebrada, tipos errados, etc.). */
export function normalizeSearchQuery(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(raw);
  }
  return undefined;
}

export async function executeProductSearch(query?: string) {
  try {
    const q = query?.trim();
    if (!q) {
      const allProducts = await db.select().from(products).limit(10);
      return { success: true, products: allProducts };
    }
    
    const searchResults = await db.select().from(products).where(
      or(
        ilike(products.name, `%${q}%`),
        ilike(products.description, `%${q}%`)
      )
    ).limit(10);
    return { success: true, products: searchResults };
  } catch (error) {
    console.error('Search internal error:', error);
    return { success: false, error: 'Falha ao buscar produtos' };
  }
}

export const shoppingTools = (userId: string) => ({
  // Buscar produtos (aceita args malformados vindos do modelo)
  search_products: async (rawArgs: unknown) => {
    const obj =
      rawArgs && typeof rawArgs === 'object'
        ? (rawArgs as Record<string, unknown>)
        : {};
    const query = normalizeSearchQuery(obj.query);
    return executeProductSearch(query);
  },

  // Obter carrinho atual
  get_cart: async () => {
    try {
      // Buscar carrinho ativo
      let [cart] = await db.select().from(carts).where(
        and(eq(carts.userId, userId), eq(carts.status, 'active'))
      ).limit(1);

      if (!cart) {
        return { success: true, message: 'Carrinho vazio', items: [], total: 0 };
      }

      // Buscar itens do carrinho com detalhes do produto
      const items = await db.select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        productName: products.name,
        productPrice: products.price,
        productId: products.id,
        imageUrl: products.imageUrl,
        brand: products.brand,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

      const total = items.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);

      return { success: true, items, total, cartId: cart.id };
    } catch (error) {
      console.error('Get cart error:', error);
      return { success: false, error: 'Falha ao buscar carrinho' };
    }
  },

  // Adicionar ao carrinho
  add_to_cart: async (rawArgs: unknown) => {
    const obj =
      rawArgs && typeof rawArgs === 'object'
        ? (rawArgs as Record<string, unknown>)
        : {};
    const productId =
      typeof obj.productId === 'string' ? obj.productId.trim() : '';
    const quantity = Math.max(
      1,
      Math.min(99, Number(obj.quantity) || 1),
    );
    try {
      if (!productId) {
        return { success: false, error: 'productId inválido ou ausente' };
      }
      // Buscar ou criar carrinho ativo
      let [cart] = await db.select().from(carts).where(
        and(eq(carts.userId, userId), eq(carts.status, 'active'))
      ).limit(1);

      if (!cart) {
        [cart] = await db.insert(carts).values({
          userId,
          status: 'active',
        }).returning();
      }

      // Verificar se produto existe
      const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!product) return { success: false, error: 'Produto não encontrado' };

      // Verificar se item já existe no carrinho
      const [existingItem] = await db.select().from(cartItems).where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
      ).limit(1);

      if (existingItem) {
        await db.update(cartItems)
          .set({ quantity: existingItem.quantity + quantity })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        await db.insert(cartItems).values({
          cartId: cart.id,
          productId,
          quantity,
        });
      }

      return { success: true, message: `Adicionado ${quantity}x ${product.name} ao carrinho` };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, error: 'Falha ao adicionar ao carrinho' };
    }
  },

  update_cart_item: async (itemId: string, quantity: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(quantity)));
    try {
      const [row] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId))
        .limit(1);
      if (!row) return { success: false, error: 'Item não encontrado' };
      const [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, row.cartId))
        .limit(1);
      if (!cart || cart.userId !== userId) {
        return { success: false, error: 'Não autorizado' };
      }
      await db
        .update(cartItems)
        .set({ quantity: q })
        .where(eq(cartItems.id, itemId));
      return { success: true };
    } catch (error) {
      console.error('Update cart item error:', error);
      return { success: false, error: 'Falha ao atualizar item' };
    }
  },

  remove_cart_item: async (itemId: string) => {
    try {
      const [row] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, itemId))
        .limit(1);
      if (!row) return { success: false, error: 'Item não encontrado' };
      const [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, row.cartId))
        .limit(1);
      if (!cart || cart.userId !== userId) {
        return { success: false, error: 'Não autorizado' };
      }
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return { success: true };
    } catch (error) {
      console.error('Remove cart item error:', error);
      return { success: false, error: 'Falha ao remover item' };
    }
  },

  // Finalizar compra: cria registro em `orders` e encerra carrinho
  complete_purchase: async () => {
    return createOrderFromActiveCart(userId);
  },
});

/**
 * Formato OpenAI / OpenRouter (JSON Schema em minúsculas).
 * Evita modelos gerarem JSON inválido por causa de tipos tipo OBJECT/STRING.
 */
export const shoppingToolsDeclaration = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description:
        "Busca produtos no catálogo pelo nome ou descrição. Se não passar query ou for vazio, retorna uma amostra dos principais produtos.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Termo de busca (ex.: iPhone, tênis). Opcional: omita para listar produtos em destaque.",
          },
        },
        required: [] as string[],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_cart",
      description:
        "Retorna o conteúdo do carrinho atual do usuário, incluindo itens e valor total.",
      parameters: {
        type: "object",
        properties: {},
        required: [] as string[],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_to_cart",
      description: "Adiciona um produto ao carrinho pelo ID (UUID).",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "UUID do produto retornado por search_products.",
          },
          quantity: {
            type: "number",
            description: "Quantidade inteira entre 1 e 99.",
            minimum: 1,
            maximum: 99,
          },
        },
        required: ["productId", "quantity"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "complete_purchase",
      description: "Finaliza a venda e fecha o carrinho ativo do usuário.",
      parameters: {
        type: "object",
        properties: {},
        required: [] as string[],
      },
    },
  },
];
