export type OrderStatusFilter = "all" | "transit" | "delivered";

export type OrderTimelineStep = {
  id: string;
  label: string;
  time: string;
  state: "done" | "current" | "pending";
  icon: "check" | "truck" | "dot";
};

export type OrderLine = {
  id: string;
  name: string;
  subtitle: string;
  qty: number;
  imageUrl?: string | null;
  icon?: "socks";
};

/** Resposta GET /api/orders */
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

/** Resposta GET /api/orders/:id */
export type OrderDetailDto = OrderListItemDto & {
  kpiEstimated: string | null;
  kpiDistance: string | null;
  timeline: OrderTimelineStep[];
  timelineProgressPct: number;
  addressTitle: string;
  addressText: string;
  lines: OrderLine[];
};
