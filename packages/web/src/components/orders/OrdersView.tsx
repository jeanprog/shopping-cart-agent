import React, { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { formatBRLFromCents } from "../../lib/formatCurrency";
import {
  fetchOrderDetail,
  fetchOrdersList,
} from "../../services/ordersApi";
import type {
  OrderDetailDto,
  OrderListItemDto,
  OrderStatusFilter,
} from "../../types/order";

export type OrdersViewProps = {
  token: string;
  onBackToChat: () => void;
  /** Envia texto para o chat principal e troca de aba */
  onOpenChatWithDraft?: (draft: string) => void;
  /** Abre configuração de endereços */
  onOpenAddressSettings?: () => void;
};

function matchesFilter(o: OrderListItemDto, f: OrderStatusFilter): boolean {
  if (f === "all") return true;
  if (f === "transit")
    return o.status === "transit" || o.status === "preparing";
  if (f === "delivered") return o.status === "delivered";
  return true;
}

function orderInTransit(o: OrderListItemDto): boolean {
  return o.status === "transit" || o.status === "preparing";
}

/** Ex.: PED-123 → #123 para o título "Pedido #…" */
function formatOrderHeadingCode(code: string): string {
  const c = code.trim();
  const n = c.replace(/^#?PED-/i, "");
  return n ? `#${n}` : c;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  token,
  onBackToChat,
  onOpenChatWithDraft,
  onOpenAddressSettings,
}) => {
  const [orders, setOrders] = useState<OrderListItemDto[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<OrderDetailDto | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [supportInput, setSupportInput] = useState("");

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setSelectedId("");
      setListLoading(false);
      return;
    }
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    void fetchOrdersList(token)
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
        setSelectedId((prev) => {
          if (prev && list.some((o) => o.id === prev)) return prev;
          return list[0]?.id ?? "";
        });
      })
      .catch(() => {
        if (!cancelled) {
          setListError("Não foi possível carregar seus pedidos.");
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void fetchOrderDetail(token, selectedId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => matchesFilter(o, filter)).filter((o) => {
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const selectedForDisplay = detail?.id === selectedId ? detail : null;

  const sendSupport = () => {
    const t = supportInput.trim();
    if (!t || !onOpenChatWithDraft) return;
    onOpenChatWithDraft(t);
    setSupportInput("");
  };

  const quickAsk = (text: string) => {
    onOpenChatWithDraft?.(text);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative bg-brand-dark">
      <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Coluna: lista */}
        <div className="w-full lg:w-[400px] lg:max-w-[40%] border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col min-h-0 bg-brand-dark z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          <div className="p-6 border-b border-gray-800 flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">Meus Pedidos</h2>
              {onOpenAddressSettings && (
                <button
                  type="button"
                  onClick={onOpenAddressSettings}
                  className="shrink-0 text-xs font-semibold text-brand-blue hover:text-white border border-brand-blue/40 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <i className="fa-solid fa-location-dot mr-1" />
                  Endereços
                </button>
              )}
            </div>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número ou item..."
                className="w-full pl-11 pr-4 py-3 bg-brand-gray border border-gray-700 rounded-xl text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-inner"
                aria-label="Buscar pedidos"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {(
                [
                  ["all", "Todos"],
                  ["transit", "Em trânsito"],
                  ["delivered", "Entregues"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shadow-sm border",
                    filter === key
                      ? "bg-brand-gray text-white border-gray-600"
                      : "bg-brand-dark text-brand-muted border-gray-700 hover:bg-brand-gray hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-3">
            {listError && (
              <p className="text-sm text-red-400 text-center py-4">{listError}</p>
            )}
            {listLoading && orders.length === 0 && !listError ? (
              <p className="text-sm text-brand-muted text-center py-8">
                Carregando pedidos…
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-8">
                Nenhum pedido encontrado.
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    "text-left border rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all w-full",
                    selectedId === o.id && orderInTransit(o)
                      ? "border-brand-blue/40 bg-brand-gray/80 hover:shadow-glow hover:border-brand-blue"
                      : "border-gray-800 bg-brand-gray/50 hover:border-gray-600 hover:bg-brand-gray",
                  )}
                >
                  {orderInTransit(o) && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue shadow-[0_0_10px_rgba(123,179,209,0.8)]" />
                  )}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          orderInTransit(o)
                            ? "text-brand-blue"
                            : "text-brand-muted",
                        )}
                      >
                        {o.code.startsWith("#") ? o.code : `#${o.code}`}
                      </span>
                      <h3 className="font-bold text-white mt-1 text-sm line-clamp-2">
                        {o.title}
                      </h3>
                    </div>
                    <span
                      className="text-brand-muted shrink-0 p-1"
                      aria-hidden
                    >
                      <i className="fa-solid fa-ellipsis-vertical" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 text-sm">
                    <div className="flex items-start gap-3">
                      {o.status === "delivered" ? (
                        <i className="fa-solid fa-circle-check text-green-500 mt-0.5 w-4 text-center opacity-80" />
                      ) : (
                        <i className="fa-solid fa-box text-brand-muted mt-0.5 w-4 text-center" />
                      )}
                      <div>
                        <p className="text-brand-muted text-xs">Status</p>
                        <p className="font-medium text-white">{o.statusLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="fa-regular fa-calendar text-brand-muted mt-0.5 w-4 text-center" />
                      <div>
                        <p className="text-brand-muted text-xs">{o.dateLabel}</p>
                        <p className="font-medium text-white">{o.dateSubLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center gap-2">
                    <span className="font-bold text-white tabular-nums">
                      {formatBRLFromCents(o.totalCents)}
                    </span>
                    {orderInTransit(o) ? (
                      <span className="px-3 py-1 bg-brand-yellow text-brand-dark text-xs font-bold rounded-full shadow-[0_0_10px_rgba(230,255,85,0.2)] shrink-0">
                        Acompanhar
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-brand-dark border border-gray-700 text-brand-muted text-xs font-medium rounded-full shrink-0">
                        Ver detalhes
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Coluna: detalhe */}
        <div className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-800 bg-brand-dark overflow-hidden">
          {selectedForDisplay ? (
            <>
              <div className="p-6 lg:p-8 border-b border-gray-800 flex justify-between items-center gap-4 bg-brand-dark shrink-0 z-20 lg:sticky lg:top-0">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                    Pedido {formatOrderHeadingCode(selectedForDisplay.code)}
                  </h2>
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border shrink-0",
                      orderInTransit(selectedForDisplay)
                        ? "bg-brand-blue/10 text-brand-blue border-brand-blue/30 shadow-[0_0_10px_rgba(123,179,209,0.1)]"
                        : "bg-green-500/10 text-green-400 border-green-500/30",
                    )}
                  >
                    {orderInTransit(selectedForDisplay) && (
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse shadow-[0_0_5px_rgba(123,179,209,0.8)]" />
                    )}
                    {selectedForDisplay.statusLabel}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 lg:p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-brand-gray border border-gray-700 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:border-brand-yellow/50 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow/20 group-hover:bg-brand-yellow/50 transition-colors" />
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center mb-2 border border-brand-yellow/20">
                      <i className="fa-regular fa-clock" />
                    </div>
                    <p className="text-xs text-brand-muted font-medium">
                      Tempo Estimado
                    </p>
                    <p className="text-lg font-bold text-white mt-1">
                      {selectedForDisplay.kpiEstimated ?? "—"}
                    </p>
                  </div>
                  <div className="bg-brand-gray border border-gray-700 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:border-green-500/50 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 group-hover:bg-green-500/50 transition-colors" />
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mb-2 border border-green-500/20">
                      <i className="fa-solid fa-route" />
                    </div>
                    <p className="text-xs text-brand-muted font-medium">
                      Distância
                    </p>
                    <p className="text-lg font-bold text-white mt-1">
                      {selectedForDisplay.kpiDistance ?? "—"}
                    </p>
                  </div>
                  <div className="bg-brand-gray border border-gray-700 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:border-brand-blue/50 transition-colors sm:col-span-1 col-span-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue/20 group-hover:bg-brand-blue/50 transition-colors" />
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-2 border border-brand-blue/20">
                      <i className="fa-solid fa-tag" />
                    </div>
                    <p className="text-xs text-brand-muted font-medium">
                      Valor Total
                    </p>
                    <p className="text-lg font-bold text-white mt-1 tabular-nums">
                      {formatBRLFromCents(selectedForDisplay.totalCents)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">
                    Itens do Pedido
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedForDisplay.lines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center gap-4 p-3 border border-gray-800 bg-brand-gray/50 rounded-xl hover:bg-brand-gray transition-colors"
                      >
                        <div className="w-16 h-16 bg-brand-dark rounded-lg flex items-center justify-center p-1 border border-gray-700 shrink-0">
                          {line.icon === "socks" ? (
                            <i className="fa-solid fa-socks text-brand-muted text-xl" />
                          ) : (
                            <img
                              className="w-full h-full object-contain drop-shadow-md"
                              src={
                                line.imageUrl ??
                                "https://placehold.co/128x128/111827/6b7280?text=Item"
                              }
                              alt=""
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white">
                            {line.name}
                          </p>
                          <p className="text-xs text-brand-muted mt-1">
                            {line.subtitle}
                          </p>
                        </div>
                        <span className="font-bold text-sm text-white shrink-0">
                          {line.qty}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">
                    Status da Entrega
                  </h3>
                  <div className="relative py-4 pl-4 border border-gray-800 rounded-2xl p-6 bg-brand-gray/30">
                    <div className="flex items-center justify-between relative z-10 gap-1">
                      {selectedForDisplay.timeline.map((step) => (
                        <div
                          key={step.id}
                          className="flex flex-col items-center gap-2 w-1/3 min-w-0"
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border-4 border-brand-dark z-10 relative shadow-[0_0_10px_rgba(123,179,209,0.5)]",
                              step.state === "pending"
                                ? "bg-brand-gray border border-gray-600 text-gray-500"
                                : "bg-brand-blue text-brand-dark",
                            )}
                          >
                            {step.icon === "check" && (
                              <i className="fa-solid fa-check text-xs" />
                            )}
                            {step.icon === "truck" && (
                              <i className="fa-solid fa-truck-fast text-xs" />
                            )}
                            {step.icon === "dot" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                            )}
                          </div>
                          <div className="text-center px-0.5">
                            <p
                              className={cn(
                                "text-xs font-bold",
                                step.state === "pending"
                                  ? "text-brand-muted font-medium"
                                  : "text-white",
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-[10px] text-brand-muted mt-0.5">
                              {step.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-[34px] left-0 w-full px-8 sm:px-12 z-0 pointer-events-none">
                      <div className="h-1 w-full bg-gray-800 rounded-full relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-brand-blue rounded-full shadow-[0_0_8px_rgba(123,179,209,0.6)]"
                          style={{
                            width: `${selectedForDisplay.timelineProgressPct}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-800 bg-brand-gray/20 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-brand-muted uppercase mb-3">
                    Endereço de Entrega
                  </h4>
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-location-dot text-brand-blue mt-1 drop-shadow-[0_0_5px_rgba(123,179,209,0.5)]" />
                    <div>
                      <p className="font-bold text-sm text-white">
                        {selectedForDisplay.addressTitle}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 whitespace-pre-line">
                        {selectedForDisplay.addressText}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="py-3 px-4 bg-brand-gray border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
                    onClick={() =>
                      quickAsk(
                        `Preciso da 2ª via da nota do pedido ${selectedForDisplay.code}`,
                      )
                    }
                  >
                    <i className="fa-solid fa-file-invoice text-brand-muted" />{" "}
                    2ª Via da Nota
                  </button>
                  <button
                    type="button"
                    className="py-3 px-4 bg-brand-gray border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
                    onClick={() =>
                      quickAsk(
                        `Quero saber sobre troca ou devolução do pedido ${selectedForDisplay.code}`,
                      )
                    }
                  >
                    <i className="fa-solid fa-rotate-left text-brand-muted" />{" "}
                    Troca/Devolução
                  </button>
                  <button
                    type="button"
                    className="py-3 px-4 bg-white text-brand-dark rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 sm:col-span-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    onClick={() =>
                      onOpenChatWithDraft?.(
                        `Quero comprar novamente os itens do pedido ${selectedForDisplay.code}.`,
                      )
                    }
                  >
                    <i className="fa-solid fa-rotate-right" /> Comprar Novamente
                  </button>
                </div>
              </div>
            </>
          ) : selectedId && detailLoading ? (
            <div className="p-8 text-brand-muted text-sm flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner fa-spin" aria-hidden />
              Carregando detalhes…
            </div>
          ) : selectedId ? (
            <div className="p-8 text-brand-muted text-sm">
              Não foi possível carregar os detalhes deste pedido.
            </div>
          ) : (
            <div className="p-8 text-brand-muted text-sm">Selecione um pedido.</div>
          )}
        </div>

        {/* Coluna: mapa + suporte */}
        <div className="w-full lg:w-[420px] flex flex-col min-h-0 max-h-[85vh] lg:max-h-none border-t lg:border-t-0 lg:border-l border-gray-800 bg-brand-dark">
          <div
            className="h-[200px] lg:h-[240px] relative border-b border-gray-800 shrink-0"
            style={{
              backgroundImage: "radial-gradient(#111827 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundColor: "#070A0E",
            }}
          >
            <div className="absolute inset-0 p-4">
              <div className="bg-brand-gray/90 backdrop-blur-md rounded-xl p-3 shadow-md inline-block border border-gray-700">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_5px_rgba(123,179,209,0.8)] animate-pulse" />
                  Entrega a caminho
                </p>
              </div>
              <svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <path
                  d="M20,20 L40,60 L80,80"
                  fill="none"
                  stroke="#7BB3D1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(123,179,209,0.5))",
                  }}
                />
                <circle cx="20" cy="20" r="4" fill="#7BB3D1" />
                <circle cx="80" cy="80" r="4" fill="#E6FF55" />
              </svg>
              <div className="absolute top-[45%] left-[45%] w-8 h-8 bg-brand-dark rounded-full shadow-[0_0_15px_rgba(123,179,209,0.4)] border-2 border-brand-blue flex items-center justify-center text-brand-blue z-10">
                <i className="fa-solid fa-truck-fast text-xs" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-brand-dark">
            <div className="p-4 bg-brand-gray/50 border-b border-gray-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-brand-dark flex items-center justify-center shadow-[0_0_15px_rgba(123,179,209,0.3)]">
                <i className="fa-solid fa-robot" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Assistente ShopAI
                </h3>
                <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-blue text-brand-dark flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(123,179,209,0.2)]">
                  <i className="fa-solid fa-robot text-xs" />
                </div>
                <div className="bg-brand-gray border border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-300 max-w-[85%]">
                  Olá! Vi que você está acompanhando o pedido{" "}
                  <strong className="text-white">
                    {selectedForDisplay
                      ? selectedForDisplay.code.startsWith("#")
                        ? selectedForDisplay.code
                        : `#${selectedForDisplay.code}`
                      : "—"}
                  </strong>
                  . Como posso ajudar com ele hoje?
                </div>
              </div>
              <div className="flex flex-col gap-2 pl-11">
                <button
                  type="button"
                  className="text-left px-4 py-2 bg-brand-gray border border-gray-700 text-brand-text rounded-xl text-xs font-medium hover:border-brand-blue hover:text-brand-blue transition-colors w-fit shadow-sm"
                  onClick={() => quickAsk("Onde está meu pedido?")}
                >
                  Onde está meu pedido?
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2 bg-brand-gray border border-gray-700 text-brand-text rounded-xl text-xs font-medium hover:border-brand-blue hover:text-brand-blue transition-colors w-fit shadow-sm"
                  onClick={() => quickAsk("Quero falar com o entregador")}
                >
                  Falar com o entregador
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2 bg-brand-gray border border-gray-700 text-brand-text rounded-xl text-xs font-medium hover:border-brand-blue hover:text-brand-blue transition-colors w-fit shadow-sm"
                  onClick={() => quickAsk("Como funciona a devolução?")}
                >
                  Como funciona a devolução?
                </button>
              </div>
            </div>

            <div className="p-4 bg-brand-gray/50 border-t border-gray-800 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={supportInput}
                  onChange={(e) => setSupportInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendSupport();
                  }}
                  placeholder="Pergunte algo sobre o pedido..."
                  className="w-full pl-4 pr-12 py-3 bg-brand-dark border border-gray-700 rounded-xl text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={sendSupport}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center hover:bg-[#d4ed3e] transition-colors shadow-[0_0_10px_rgba(230,255,85,0.2)]"
                  aria-label="Enviar"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6 pt-2 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent">
        <div className="pointer-events-auto glass-panel px-6 py-3 rounded-full shadow-soft flex items-center gap-6 border border-gray-700 max-w-[calc(100%-2rem)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              Pedidos
            </span>
          </div>
          <div className="w-px h-6 bg-gray-700 shrink-0" />
          <button
            type="button"
            onClick={onBackToChat}
            className="text-sm font-bold text-brand-blue hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <i className="fa-solid fa-arrow-left" />
            Voltar ao chat
          </button>
        </div>
      </div>
    </div>
  );
};
