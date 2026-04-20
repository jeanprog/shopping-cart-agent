import React, { useEffect, useReducer, useRef } from "react";
import { Streamdown } from "streamdown";
import { useChatStore } from "../store/chatStore";
import { useCartStore } from "../store/cartStore";
import { useShoppingChatMessage } from "../hooks/useShoppingChatMessage";
import { cn } from "../lib/utils";
import { ChatProductCarousel } from "../components/chat/ChatProductCarousel";
import { ShopAppShell } from "../components/layout/ShopAppShell";
import { SettingsModal } from "../components/settings/SettingsModal";
import { ExploreCatalog } from "../components/explore/ExploreCatalog";
import { CartCheckoutView } from "../components/cart/CartCheckoutView";
import { OrdersView } from "../components/orders/OrdersView";
import { Send, User } from "lucide-react";

type MainView = "chat" | "explore" | "cart" | "orders";

type ChatPageState = {
  mainView: MainView;
  input: string;
  addingProductId: string | null;
  settingsOpen: boolean;
};

type ChatPageAction =
  | { type: "SET_MAIN_VIEW"; view: MainView }
  | { type: "SET_INPUT"; value: string }
  | { type: "CLEAR_INPUT" }
  | { type: "SET_ADDING_PRODUCT"; id: string | null }
  | { type: "SET_SETTINGS_OPEN"; open: boolean }
  | { type: "OPEN_CHAT_WITH_DRAFT"; draft: string };

const initialState: ChatPageState = {
  mainView: "chat",
  input: "",
  addingProductId: null,
  settingsOpen: false,
};

function chatPageReducer(
  state: ChatPageState,
  action: ChatPageAction,
): ChatPageState {
  switch (action.type) {
    case "SET_MAIN_VIEW":
      return { ...state, mainView: action.view };
    case "SET_INPUT":
      return { ...state, input: action.value };
    case "CLEAR_INPUT":
      return { ...state, input: "" };
    case "SET_ADDING_PRODUCT":
      return { ...state, addingProductId: action.id };
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.open };
    case "OPEN_CHAT_WITH_DRAFT":
      return { ...state, mainView: "chat", input: action.draft };
    default:
      return state;
  }
}

export const ChatPage: React.FC = () => {
  const [state, dispatch] = useReducer(chatPageReducer, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, token, user, logout } = useChatStore();

  const { items, fetchCart, addToCart } = useCartStore();
  const { sendUserText } = useShoppingChatMessage();

  const handleAddProductFromChat = async (productId: string) => {
    if (!token) return;
    dispatch({ type: "SET_ADDING_PRODUCT", id: productId });
    try {
      await addToCart(token, productId, 1);
    } finally {
      dispatch({ type: "SET_ADDING_PRODUCT", id: null });
    }
  };

  const handleAddFromExplore = async (productId: string) => {
    await handleAddProductFromChat(productId);
  };

  const handleAskAboutResults = (draft: string) => {
    dispatch({ type: "SET_INPUT", value: draft });
    dispatch({ type: "SET_MAIN_VIEW", view: "chat" });
  };

  const handleOpenChatWithDraft = (draft: string) => {
    dispatch({ type: "OPEN_CHAT_WITH_DRAFT", draft });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token) {
      fetchCart(token);
    }
  }, [token, fetchCart]);

  const handleSend = () => {
    if (!state.input.trim() || isLoading || !token) return;
    const userMessage = state.input.trim();
    const snapshot = messages;
    dispatch({ type: "CLEAR_INPUT" });
    void sendUserText(userMessage, snapshot);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Você";
  const initial = (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase();
  const safeToken = token ?? "";

  return (
    <>
      <ShopAppShell
        activeTab={state.mainView}
        onSelectChat={() =>
          dispatch({ type: "SET_MAIN_VIEW", view: "chat" })
        }
        onSelectExplore={() =>
          dispatch({ type: "SET_MAIN_VIEW", view: "explore" })
        }
        onSelectCart={() =>
          dispatch({ type: "SET_MAIN_VIEW", view: "cart" })
        }
        onSelectOrders={() =>
          dispatch({ type: "SET_MAIN_VIEW", view: "orders" })
        }
        cartItemCount={items.length}
        displayName={displayName}
        userInitial={initial}
        onLogout={logout}
        onOpenSettings={() =>
          dispatch({ type: "SET_SETTINGS_OPEN", open: true })
        }
      >
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-brand-dark">
          {state.mainView === "explore" ? (
            <ExploreCatalog
              token={safeToken}
              onBackToChat={() =>
                dispatch({ type: "SET_MAIN_VIEW", view: "chat" })
              }
              onAskAboutResults={handleAskAboutResults}
              onAddToCart={handleAddFromExplore}
              addingProductId={state.addingProductId}
            />
          ) : state.mainView === "cart" ? (
            <CartCheckoutView
              token={safeToken}
              onBackToChat={() =>
                dispatch({ type: "SET_MAIN_VIEW", view: "chat" })
              }
            />
          ) : state.mainView === "orders" ? (
            <OrdersView
              token={safeToken}
              onBackToChat={() =>
                dispatch({ type: "SET_MAIN_VIEW", view: "chat" })
              }
              onOpenChatWithDraft={handleOpenChatWithDraft}
              onOpenAddressSettings={() =>
                dispatch({ type: "SET_SETTINGS_OPEN", open: true })
              }
            />
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-brand-dark gradient-bg">
              <div className="border-b border-gray-800 px-8 lg:px-16 py-4 flex items-center gap-3 shrink-0 bg-brand-dark/80 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_12px_rgba(123,179,209,0.5)]" />
                <span className="text-sm font-bold text-white tracking-tight">
                  Concierge Inteligente
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-8 flex flex-col scroll-smooth min-h-0">
                <div className="max-w-3xl mx-auto w-full space-y-10">
                  {messages.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 opacity-80">
                      <div className="text-6xl">✨</div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          Inicie sua jornada
                        </h2>
                        <p className="text-base text-brand-muted max-w-sm mx-auto">
                          Peça recomendações de produtos ou faça perguntas
                          sobre o catálogo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex gap-4 group animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all mt-1",
                            message.role === "user"
                              ? "bg-brand-gray border-gray-700 shadow-sm"
                              : "bg-brand-blue/20 border-brand-blue/40 shadow-lg shadow-brand-blue/5",
                          )}
                        >
                          {message.role === "user" ? (
                            <User className="w-5 h-5 text-brand-muted" />
                          ) : (
                            <span className="w-9 h-9 rounded-lg bg-brand-yellow flex items-center justify-center shadow-md">
                              <i className="fa-solid fa-bag-shopping text-brand-dark text-sm" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">
                              {message.role === "assistant"
                                ? "AI Concierge"
                                : "Você"}
                            </span>
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          {message.role === "assistant" ? (
                            <div className="rounded-2xl bg-[#1a2332] border border-brand-blue/25 px-4 py-3 shadow-lg">
                              <div className="text-[15px] leading-relaxed text-brand-text">
                                <Streamdown>{message.content}</Streamdown>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[15px] leading-relaxed text-brand-text">
                              <Streamdown>{message.content}</Streamdown>
                            </div>
                          )}
                          {message.role === "assistant" &&
                            message.products &&
                            message.products.length > 0 && (
                              <ChatProductCarousel
                                products={message.products}
                                onAddToCart={handleAddProductFromChat}
                                addingId={state.addingProductId}
                              />
                            )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>

              <div className="w-full bg-gradient-to-t from-brand-dark via-brand-dark to-transparent p-4 pt-2 shrink-0 border-t border-gray-800/50">
                <div className="max-w-3xl mx-auto w-full">
                  <div className="glass-panel p-2 rounded-2xl border border-gray-800 shadow-2xl relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={state.input}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_INPUT",
                            value: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyDown}
                        className="w-full h-14 pl-5 pr-14 rounded-xl bg-transparent text-white outline-none focus:ring-0 transition-all placeholder:text-brand-muted text-[15px]"
                        placeholder="O que você deseja descobrir hoje?"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || !state.input.trim()}
                        className={cn(
                          "absolute right-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                          state.input.trim()
                            ? "bg-brand-blue text-brand-dark hover:opacity-90 shadow-lg shadow-brand-blue/20 active:scale-90"
                            : "text-gray-600",
                        )}
                        aria-label="Enviar mensagem"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[10px] font-bold text-brand-muted uppercase tracking-[0.3em] opacity-60">
                    IA Concierge • ShopAI
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ShopAppShell>
      <SettingsModal
        open={state.settingsOpen}
        onClose={() =>
          dispatch({ type: "SET_SETTINGS_OPEN", open: false })
        }
        token={safeToken}
      />
    </>
  );
};
