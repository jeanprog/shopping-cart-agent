import React from "react";
import { ShoppingCart, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

export type ShopMainTab = "chat" | "explore" | "cart" | "orders";

export type ShopAppShellProps = {
  activeTab: ShopMainTab;
  onSelectChat: () => void;
  onSelectExplore: () => void;
  onSelectCart: () => void;
  onSelectOrders: () => void;
  cartItemCount: number;
  displayName: string;
  userInitial: string;
  onLogout: () => void;
  /** Abre configurações (ex.: endereços). */
  onOpenSettings?: () => void;
  children: React.ReactNode;
};

export const ShopAppShell: React.FC<ShopAppShellProps> = ({
  activeTab,
  onSelectChat,
  onSelectExplore,
  onSelectCart,
  onSelectOrders,
  cartItemCount,
  displayName,
  userInitial,
  onLogout,
  onOpenSettings,
  children,
}) => {
  const tabClass = (tab: ShopMainTab) =>
    cn(
      "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-2 transition-colors border shadow-sm",
      activeTab === tab
        ? "bg-brand-blue/10 border border-brand-blue text-brand-blue font-semibold"
        : "bg-brand-gray border border-gray-800 text-brand-muted hover:text-white hover:border-gray-700",
    );

  return (
    <main
      id="shop-app-shell"
      className="w-full max-w-[1440px] flex-1 min-h-0 flex flex-col overflow-hidden bg-brand-dark shadow-2xl rounded-[32px] border border-gray-800"
    >
      <header
        id="global-navigation"
        className="w-full px-8 lg:px-16 pt-8 pb-6 flex flex-col gap-6 bg-brand-dark z-20 border-b border-gray-800 shrink-0"
      >
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-glow shrink-0">
              <i className="fa-solid fa-bag-shopping text-brand-dark text-xl" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight truncate">
              ShopAI
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-brand-muted hover:text-white hover:bg-gray-800 transition-colors border border-gray-800 shadow-sm"
                aria-label="Configurações e endereços"
                title="Configurações"
              >
                <i className="fa-solid fa-gear" />
              </button>
            )}
            <button
              type="button"
              onClick={onSelectCart}
              className="relative w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-brand-muted hover:text-white hover:bg-gray-800 transition-colors border border-gray-800 shadow-sm"
              aria-label="Abrir carrinho e checkout"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-blue text-[10px] font-bold text-brand-dark flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="sm:hidden w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-red-400 hover:bg-gray-800 border border-gray-800"
              aria-label="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col items-end max-w-[140px]">
              <span className="text-xs font-semibold text-white truncate w-full text-right">
                {displayName}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Sair
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center overflow-hidden border-2 border-brand-blue shadow-sm text-brand-blue font-bold">
              {userInitial}
            </div>
          </div>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar"
          aria-label="Áreas principais"
        >
          <button
            type="button"
            onClick={onSelectChat}
            className={tabClass("chat")}
            aria-current={activeTab === "chat" ? "page" : undefined}
          >
            <i className="fa-solid fa-message" /> Chat de Compras
          </button>
          <button
            type="button"
            onClick={onSelectExplore}
            className={tabClass("explore")}
            aria-current={activeTab === "explore" ? "page" : undefined}
          >
            <i className="fa-solid fa-magnifying-glass" /> Buscar & Explorar
          </button>
          <button
            type="button"
            onClick={onSelectCart}
            className={tabClass("cart")}
            aria-current={activeTab === "cart" ? "page" : undefined}
          >
            <i className="fa-solid fa-cart-shopping" /> Carrinho & Checkout
          </button>
          <button
            type="button"
            onClick={onSelectOrders}
            className={tabClass("orders")}
            aria-current={activeTab === "orders" ? "page" : undefined}
          >
            <i className="fa-solid fa-box" /> Pedidos
          </button>
        </nav>
      </header>

      {children}
    </main>
  );
};
