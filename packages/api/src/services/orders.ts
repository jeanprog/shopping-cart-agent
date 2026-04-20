import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index";
import {
  carts,
  cartItems,
  orderItems,
  orders,
  products,
  type OrderTimelineJson,
} from "../db/schema";
import { resolveShippingForOrder } from "./addressService";

function makeOrderCode(): string {
  const n = Math.floor(10000000 + Math.random() * 90000000);
  return `PED-${n}`;
}

function transitTimeline(): OrderTimelineJson {
  return [
    {
      id: "t1",
      label: "Preparando",
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      state: "done",
      icon: "check",
    },
    {
      id: "t2",
      label: "Em trânsito",
      time: "—",
      state: "current",
      icon: "truck",
    },
    {
      id: "t3",
      label: "Entregue",
      time: "Prev: 18:00",
      state: "pending",
      icon: "dot",
    },
  ];
}

function buildSummaryTitle(names: string[]): string {
  const uniq = [...new Set(names)];
  if (uniq.length === 0) return "Pedido";
  if (uniq.length === 1) return uniq[0]!;
  if (uniq.length === 2) return `${uniq[0]} + ${uniq[1]}`;
  return `${uniq[0]} + ${uniq.length - 1} itens`;
}

function lineSubtitleFromProduct(
  brand: string | null,
  description: string | null,
): string {
  const d = description?.trim();
  if (d && d.length > 0) return d.length > 80 ? `${d.slice(0, 77)}…` : d;
  return brand ? `${brand} · catálogo` : "1 un.";
}

/**
 * Finaliza o carrinho ativo: cria pedido + itens, esvazia itens do carrinho e marca carrinho como concluído.
 * Endereço: `addressId` opcional (UUID salvo em `user_addresses`); senão usa o endereço padrão ou fallback.
 */
export async function createOrderFromActiveCart(
  userId: string,
  options?: { addressId?: string },
): Promise<{ success: boolean; orderId?: string; message?: string; error?: string }> {
  try {
    const result = await db.transaction(async (tx) => {
      const [cart] = await tx
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
        .limit(1);

      if (!cart) {
        return { ok: false as const, error: "Nenhum carrinho ativo encontrado" };
      }

      const rows = await tx
        .select({
          cartItemId: cartItems.id,
          quantity: cartItems.quantity,
          productId: products.id,
          name: products.name,
          price: products.price,
          brand: products.brand,
          description: products.description,
          imageUrl: products.imageUrl,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      if (rows.length === 0) {
        return { ok: false as const, error: "Carrinho vazio" };
      }

      const totalCents = rows.reduce(
        (acc, r) => acc + r.price * r.quantity,
        0,
      );
      const summaryTitle = buildSummaryTitle(rows.map((r) => r.name));

      let orderCode = makeOrderCode();
      for (let i = 0; i < 5; i++) {
        const [exists] = await tx
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.orderCode, orderCode))
          .limit(1);
        if (!exists) break;
        orderCode = makeOrderCode();
      }

      const shipping = await resolveShippingForOrder(
        tx,
        userId,
        options?.addressId,
      );

      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          addressId: shipping.addressId,
          orderCode,
          status: "transit",
          statusLabel: "Em trânsito",
          totalCents,
          summaryTitle,
          dateLabel: "Previsão de Entrega",
          dateValue: "Hoje, até 18:00",
          addressTitle: shipping.addressTitle,
          addressLines: shipping.addressLines,
          kpiEstimated: "~25 min",
          kpiDistance: "12 km",
          timelineProgressPct: 60,
          timeline: transitTimeline(),
        })
        .returning({ id: orders.id });

      if (!order) {
        return { ok: false as const, error: "Falha ao criar pedido" };
      }

      for (const r of rows) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: r.productId,
          quantity: r.quantity,
          unitPriceCents: r.price,
          productName: r.name,
          brand: r.brand,
          imageUrl: r.imageUrl,
          lineSubtitle: lineSubtitleFromProduct(r.brand, r.description),
        });
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      await tx
        .update(carts)
        .set({ status: "completed" })
        .where(eq(carts.id, cart.id));

      return { ok: true as const, orderId: order.id };
    });

    if (!result.ok) {
      return { success: false, error: result.error };
    }
    return {
      success: true,
      orderId: result.orderId,
      message: "Compra finalizada com sucesso!",
    };
  } catch (e) {
    console.error("createOrderFromActiveCart:", e);
    return { success: false, error: "Falha ao finalizar pedido" };
  }
}

export async function listOrdersByUser(userId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(userId: string, orderId: string) {
  const [row] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  if (!row) return null;

  const lines = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { order: row, lines };
}

export type OrderListItemDto = {
  id: string;
  code: string;
  title: string;
  status: string;
  statusLabel: string;
  dateLabel: string;
  dateSubLabel: string;
  totalCents: number;
  createdAt: string;
};

export type OrderLineDto = {
  id: string;
  name: string;
  subtitle: string;
  qty: number;
  imageUrl: string | null;
  icon?: "socks";
};

export type OrderDetailDto = OrderListItemDto & {
  kpiEstimated: string | null;
  kpiDistance: string | null;
  timeline: OrderTimelineJson;
  timelineProgressPct: number;
  addressTitle: string;
  addressText: string;
  lines: OrderLineDto[];
};

function lineToDto(
  l: typeof orderItems.$inferSelect,
): OrderLineDto {
  const socks =
    l.productName.toLowerCase().includes("meia") ||
    l.productName.toLowerCase().includes("sock");
  return {
    id: l.id,
    name: l.productName,
    subtitle: l.lineSubtitle ?? "",
    qty: l.quantity,
    imageUrl: l.imageUrl,
    ...(socks ? { icon: "socks" as const } : {}),
  };
}

export function serializeOrderListItem(
  o: typeof orders.$inferSelect,
): OrderListItemDto {
  return {
    id: o.id,
    code: o.orderCode,
    title: o.summaryTitle,
    status: o.status,
    statusLabel: o.statusLabel,
    dateLabel: o.dateLabel,
    dateSubLabel: o.dateValue,
    totalCents: o.totalCents,
    createdAt: o.createdAt.toISOString(),
  };
}

export function serializeOrderDetail(
  o: typeof orders.$inferSelect,
  lines: (typeof orderItems.$inferSelect)[],
): OrderDetailDto {
  return {
    ...serializeOrderListItem(o),
    kpiEstimated: o.kpiEstimated,
    kpiDistance: o.kpiDistance,
    timeline: o.timeline,
    timelineProgressPct: o.timelineProgressPct,
    addressTitle: o.addressTitle,
    addressText: o.addressLines,
    lines: lines.map(lineToDto),
  };
}
