import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "../../store/cartStore";
import { cn } from "../../lib/utils";
import { formatBRLFromCents } from "../../lib/formatCurrency";
import { useCheckoutBootstrap } from "../../hooks/useCheckoutBootstrap";
import {
  computeGrandTotalCents,
  computeInstallmentCents,
  sumCartItemQuantities,
} from "@/domain/checkoutTotals";
import {
  checkoutTermsFormSchema,
  type CheckoutTermsFormValues,
} from "@/schemas/checkoutTermsForm";

const PLACEHOLDER =
  "https://placehold.co/200x200/111827/6b7280?text=Produto";

export type CartCheckoutViewProps = {
  token: string;
  onBackToChat: () => void;
};

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  token,
  onBackToChat,
}) => {
  const {
    items,
    total,
    isLoading,
    fetchCart,
    updateItemQuantity,
    removeItem,
    completePurchase,
  } = useCartStore();

  const {
    bootstrapLoading,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addressDisplay,
    shippingCents,
  } = useCheckoutBootstrap(token);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutTermsFormValues>({
    resolver: zodResolver(checkoutTermsFormSchema),
    defaultValues: { termsAccepted: false },
  });

  useEffect(() => {
    if (token) void fetchCart(token);
  }, [token, fetchCart]);

  const itemCount = useMemo(() => sumCartItemQuantities(items), [items]);
  const subtotalCents = total;
  const discountCents = 0;
  const grandTotalCents = useMemo(
    () =>
      computeGrandTotalCents({
        subtotalCents,
        shippingCents,
        discountCents,
      }),
    [subtotalCents, shippingCents],
  );
  const installmentCents = useMemo(
    () => computeInstallmentCents(grandTotalCents),
    [grandTotalCents],
  );

  const handleQty = async (itemId: string, next: number) => {
    if (!token || next < 1) return;
    setUpdatingId(itemId);
    try {
      await updateItemQuantity(token, itemId, next);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!token) return;
    setUpdatingId(itemId);
    try {
      await removeItem(token, itemId);
    } finally {
      setUpdatingId(null);
    }
  };

  const onFinalize = handleSubmit(async () => {
    if (!token || items.length === 0) return;
    const res = await completePurchase(token, selectedAddressId);
    if (res.success) {
      alert(res.message ?? "Pedido registrado com sucesso!");
    }
  });

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative bg-brand-dark">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col lg:flex-row gap-12 p-6 lg:p-16 pb-36">
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            <section id="cart-items" className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-white">
                Seu Carrinho ({itemCount}{" "}
                {itemCount === 1 ? "item" : "itens"})
              </h1>

              {isLoading && items.length === 0 ? (
                <p className="text-brand-muted text-sm">Carregando carrinho…</p>
              ) : items.length === 0 ? (
                <p className="text-brand-muted text-sm">
                  Seu carrinho está vazio. Volte ao chat ou à busca para
                  adicionar produtos.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => {
                    const lineCents = item.productPrice * item.quantity;
                    const busy = updatingId === item.id;
                    const src = item.imageUrl || PLACEHOLDER;
                    return (
                      <div
                        key={item.id}
                        className="glass-panel rounded-[24px] p-4 flex gap-4 sm:gap-6 items-center border border-gray-700/50 hover:border-brand-blue/30 transition-colors"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-gray rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-800 overflow-hidden">
                          <img
                            className="w-full h-full object-contain p-2"
                            src={src}
                            alt=""
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              {item.brand && (
                                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                                  {item.brand}
                                </span>
                              )}
                              <h3 className="font-bold text-white text-base sm:text-lg mt-0.5 line-clamp-2">
                                {item.productName}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleRemove(item.id)}
                              disabled={busy}
                              className="text-brand-muted hover:text-red-400 transition-colors shrink-0 p-1"
                              aria-label="Remover item"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                          <div className="flex justify-between items-end mt-4 gap-4 flex-wrap">
                            <div className="flex items-center gap-3 border border-gray-700 bg-brand-gray rounded-xl p-1">
                              <button
                                type="button"
                                disabled={busy || item.quantity <= 1}
                                onClick={() =>
                                  void handleQty(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40"
                              >
                                −
                              </button>
                              <span className="font-semibold text-sm min-w-[1.5rem] text-center text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={busy || item.quantity >= 99}
                                onClick={() =>
                                  void handleQty(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-extrabold text-lg sm:text-xl text-white tabular-nums">
                              {formatBRLFromCents(lineCents)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-glow">
                        <i className="fa-solid fa-robot text-sm" />
                      </div>
                      <span className="font-semibold text-white">
                        Sugestão do Assistente
                      </span>
                    </div>
                    <p className="text-sm text-brand-muted leading-relaxed relative z-10">
                      Percebi que você está montando seu pedido. Que tal pedir
                      ao concierge no chat por acessórios ou ofertas combinadas?
                    </p>
                    <div className="flex items-center justify-between bg-brand-gray p-3 rounded-xl border border-gray-700 relative z-10 opacity-80">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center border border-gray-800">
                          <i className="fa-solid fa-socks text-brand-muted" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">
                            Kit complementar (exemplo)
                          </p>
                          <p className="text-xs text-brand-yellow font-medium mt-0.5">
                            Pergunte no chat para adicionar
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onBackToChat}
                        className="px-4 py-2 bg-brand-blue text-brand-dark text-xs font-bold rounded-lg hover:opacity-90 transition-colors shadow-glow"
                      >
                        Ir ao chat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section
              id="checkout-steps"
              className="flex flex-col gap-4 mt-4"
              aria-label="Etapas do checkout"
            >
              <div className="border border-brand-blue/30 rounded-[24px] overflow-hidden bg-brand-gray shadow-[0_0_15px_rgba(123,179,209,0.05)] transition-all">
                <div className="p-6 flex items-center justify-between bg-brand-blue/5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-glow">
                      1
                    </div>
                    <h3 className="font-bold text-lg text-white">
                      Endereço de Entrega
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="text-brand-muted font-medium text-sm cursor-default"
                    title="Gerencie endereços no ícone de engrenagem (topo)"
                  >
                    Config
                  </button>
                </div>
                <div className="p-6 pt-0 border-t border-brand-blue/10 space-y-4">
                  {addresses.length > 0 && (
                    <div>
                      <label className="text-xs text-brand-muted font-medium block mb-2">
                        Endereço para este pedido
                      </label>
                      <select
                        value={selectedAddressId ?? ""}
                        onChange={(e) => {
                          const v = e.target.value || null;
                          setSelectedAddressId(v);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-gray-700 text-white text-sm focus:outline-none focus:border-brand-blue"
                      >
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label}
                            {a.isDefault ? " · padrão" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="p-4 border border-brand-blue/40 rounded-xl bg-brand-blue/5 flex items-start gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                    <i className="fa-solid fa-location-dot text-brand-blue mt-1" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-white">
                        {bootstrapLoading
                          ? "Carregando endereço…"
                          : addressDisplay.title}
                      </p>
                      <p className="text-sm text-brand-muted mt-1 whitespace-pre-line">
                        {bootstrapLoading ? "—" : addressDisplay.lines}
                      </p>
                    </div>
                    <i className="fa-solid fa-circle-check text-brand-blue ml-auto shrink-0" />
                  </div>
                </div>
              </div>

              <div className="border border-gray-800 rounded-[24px] overflow-hidden bg-brand-gray hover:border-gray-600 transition-colors opacity-70 hover:opacity-100">
                <div className="p-6 flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-dark border border-gray-700 text-brand-muted flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-bold text-lg text-brand-muted">
                      Opções de Entrega
                    </h3>
                  </div>
                  <i className="fa-solid fa-chevron-down text-gray-600" />
                </div>
              </div>

              <div className="border border-gray-800 rounded-[24px] overflow-hidden bg-brand-gray hover:border-gray-600 transition-colors opacity-70 hover:opacity-100">
                <div className="p-6 flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-dark border border-gray-700 text-brand-muted flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-bold text-lg text-brand-muted">
                      Pagamento
                    </h3>
                  </div>
                  <i className="fa-solid fa-chevron-down text-gray-600" />
                </div>
              </div>
            </section>
          </div>

          <div className="w-full lg:w-1/3 lg:self-start">
            <form
              className="lg:sticky lg:top-4 glass-panel rounded-[32px] p-6 sm:p-8 flex flex-col gap-6 shadow-2xl border border-gray-700/50"
              onSubmit={onFinalize}
              noValidate
            >
              <h2 className="text-xl font-bold text-white pb-4 border-b border-gray-800">
                Resumo do Pedido
              </h2>

              <div className="flex gap-2 opacity-60">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-ticket text-brand-muted text-sm" />
                  </div>
                  <input
                    type="text"
                    disabled
                    placeholder="Cupom de desconto"
                    className="w-full pl-9 pr-4 py-3 bg-brand-dark border border-gray-700 rounded-xl text-white placeholder:text-brand-muted text-sm cursor-not-allowed"
                    title="Cupons em breve"
                  />
                </div>
                <button
                  type="button"
                  disabled
                  className="px-5 bg-brand-gray border border-gray-700 text-white rounded-xl text-sm font-bold cursor-not-allowed"
                >
                  Aplicar
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm mt-2">
                <div className="flex justify-between text-brand-muted">
                  <span>
                    Subtotal ({itemCount}{" "}
                    {itemCount === 1 ? "item" : "itens"})
                  </span>
                  <span className="font-medium text-white tabular-nums">
                    {formatBRLFromCents(subtotalCents)}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Frete</span>
                  <span className="font-medium text-brand-yellow">
                    {shippingCents <= 0
                      ? "Grátis"
                      : formatBRLFromCents(shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Descontos</span>
                  <span className="font-medium text-white tabular-nums">
                    {formatBRLFromCents(discountCents)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-5 flex justify-between items-end gap-4">
                <span className="font-bold text-brand-muted">Total</span>
                <div className="text-right">
                  <span className="font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
                    {formatBRLFromCents(grandTotalCents)}
                  </span>
                  {grandTotalCents > 0 && (
                    <p className="text-xs text-brand-muted mt-1">
                      em até 10x de {formatBRLFromCents(installmentCents)} sem
                      juros
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register("termsAccepted")}
                    className="mt-1 accent-brand-blue w-4 h-4 rounded border-gray-700 bg-brand-dark focus:ring-brand-blue focus:ring-offset-brand-gray shrink-0"
                  />
                  <span className="text-xs text-brand-muted leading-tight group-hover:text-gray-300 transition-colors">
                    Li e concordo com os{" "}
                    <span className="text-brand-blue underline decoration-brand-blue/30 underline-offset-2">
                      Termos de Serviço
                    </span>{" "}
                    e política de devolução.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-red-400 mt-2">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={items.length === 0 || isLoading}
                className={cn(
                  "w-full py-4 bg-brand-yellow text-brand-dark font-extrabold text-lg rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(230,255,85,0.2)] mt-2 group",
                  "hover:bg-[#d4ed3e] disabled:opacity-40 disabled:cursor-not-allowed",
                )}
              >
                Finalizar Compra{" "}
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-5 mt-4 text-brand-muted text-xl opacity-70">
                <i className="fa-brands fa-cc-visa hover:text-white transition-colors" />
                <i className="fa-brands fa-cc-mastercard hover:text-white transition-colors" />
                <i className="fa-brands fa-pix hover:text-brand-yellow transition-colors" />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6 pt-2 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent">
        <div className="pointer-events-auto glass-panel px-6 py-3 rounded-full shadow-soft flex items-center gap-6 border border-gray-700 max-w-[calc(100%-2rem)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              Checkout
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
