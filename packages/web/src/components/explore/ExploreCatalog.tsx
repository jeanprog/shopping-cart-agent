import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { useExploreCatalog } from "../../hooks/useExploreCatalog";
import type { ExploreSortOption } from "../../types/catalog";
import { ExploreProductCard } from "./ExploreProductCard";

export type ExploreCatalogProps = {
  token: string;
  onBackToChat: () => void;
  onAskAboutResults: (draft: string) => void;
  onAddToCart: (productId: string) => Promise<void>;
  addingProductId: string | null;
};

export const ExploreCatalog: React.FC<ExploreCatalogProps> = ({
  token,
  onBackToChat,
  onAskAboutResults,
  onAddToCart,
  addingProductId,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const {
    query,
    setQuery,
    loading,
    loadError,
    products,
    brandFilter,
    setBrandFilter,
    priceTier,
    setPriceTier,
    availability,
    setAvailability,
    delivery,
    setDelivery,
    sort,
    setSort,
    clearBrandFilter,
  } = useExploreCatalog();

  const handleAskAi = () => {
    const q = query.trim() || "os produtos listados";
    onAskAboutResults(
      `Quero saber mais sobre ${q}. Resuma os melhores custo-benefício e diferenças entre as opções.`,
    );
  };

  const handleAdd = async (productId: string) => {
    if (!token) return;
    await onAddToCart(productId);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative bg-brand-dark">
      <section
        id="hybrid-search-header"
        className="w-full bg-brand-dark border-b border-gray-800 p-6 lg:px-16 flex flex-col gap-4 z-10 shrink-0"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-2xl">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos, marcas ou categorias..."
              className="custom-input pl-12 pr-12 h-14 w-full"
              aria-label="Buscar produtos"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-blue"
              aria-label="Busca por voz em breve"
              title="Em breve"
              disabled
            >
              <i className="fa-solid fa-microphone" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAskAi}
            className="w-full lg:w-auto px-6 py-3.5 bg-brand-yellow text-brand-dark font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#d4ed3e] transition-colors shadow-[0_0_15px_rgba(230,255,85,0.2)] whitespace-nowrap flex-shrink-0"
          >
            <i className="fa-solid fa-robot" />
            Perguntar sobre estes resultados
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar w-full">
          <button
            type="button"
            onClick={() => setShowFilterPanel((v) => !v)}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm",
              showFilterPanel
                ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-gray-700 bg-brand-gray text-brand-muted hover:text-white",
            )}
            aria-expanded={showFilterPanel}
            aria-label="Filtros avançados"
            title="Filtros"
          >
            <i className="fa-solid fa-sliders" />
          </button>
          <div className="h-6 w-px bg-gray-800 mx-1 flex-shrink-0" />

          {brandFilter && (
            <button
              type="button"
              onClick={clearBrandFilter}
              className="flex-shrink-0 px-4 py-2 rounded-full border border-brand-blue bg-brand-blue/10 text-brand-blue text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              Marca: {brandFilter}{" "}
              <i className="fa-solid fa-xmark text-xs" aria-hidden />
            </button>
          )}

          <div className="relative flex-shrink-0">
            <select
              value={priceTier}
              onChange={(e) =>
                setPriceTier(
                  e.target.value as
                    | "all"
                    | "under_300"
                    | "range_300_800"
                    | "over_800",
                )
              }
              className="appearance-none pl-4 pr-8 py-2 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              aria-label="Filtrar por preço"
            >
              <option value="all">Preço: qualquer</option>
              <option value="under_300">Até R$ 300</option>
              <option value="range_300_800">R$ 300 – R$ 800</option>
              <option value="over_800">Acima de R$ 800</option>
            </select>
            <i className="fa-solid fa-chevron-down text-xs text-brand-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(
                  e.target.value as "all" | "in_stock" | "low_stock",
                )
              }
              className="appearance-none pl-4 pr-8 py-2 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              aria-label="Disponibilidade"
            >
              <option value="all">Disponibilidade: todas</option>
              <option value="in_stock">Em estoque</option>
              <option value="low_stock">Últimas unidades</option>
            </select>
            <i className="fa-solid fa-chevron-down text-xs text-brand-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={delivery}
              onChange={(e) =>
                setDelivery(e.target.value as "all" | "free_shipping_eligible")
              }
              className="appearance-none pl-4 pr-8 py-2 rounded-full border border-gray-700 bg-brand-gray text-brand-text text-sm font-medium hover:border-brand-blue cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              aria-label="Entrega"
            >
              <option value="all">Entrega: todas</option>
              <option value="free_shipping_eligible">
                Frete grátis elegível
              </option>
            </select>
            <i className="fa-solid fa-chevron-down text-xs text-brand-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            disabled
            className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-800 bg-brand-gray/50 text-brand-muted text-sm font-medium cursor-not-allowed opacity-70"
            title="Requer dados de avaliação no catálogo"
          >
            Avaliação <i className="fa-solid fa-chevron-down text-xs ml-1" />
          </button>

          <div className="ml-auto flex items-center gap-2 pl-4 border-l border-gray-800 flex-shrink-0">
            <span className="text-sm font-medium text-brand-muted">
              Ordenar por:
            </span>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as ExploreSortOption)
              }
              className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer max-w-[160px]"
              aria-label="Ordenar resultados"
            >
              <option className="bg-brand-gray" value="relevance">
                Relevância
              </option>
              <option className="bg-brand-gray" value="price_asc">
                Menor Preço
              </option>
              <option className="bg-brand-gray" value="price_desc">
                Maior Preço
              </option>
              <option className="bg-brand-gray" value="top_rated">
                Mais populares
              </option>
            </select>
          </div>
        </div>

        {showFilterPanel && (
          <div className="rounded-xl border border-gray-800 bg-brand-gray/40 p-4 text-sm text-brand-muted">
            <p className="font-semibold text-white mb-2">Marcas rápidas</p>
            <div className="flex flex-wrap gap-2">
              {["Nike", "Adidas", "Asics", "Hoka"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() =>
                    setBrandFilter((prev) => (prev === b ? null : b))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                    brandFilter === b
                      ? "border-brand-blue bg-brand-blue/15 text-brand-blue"
                      : "border-gray-700 bg-brand-dark text-brand-text hover:border-gray-600",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 px-6 lg:px-16 pt-2 pb-4 bg-brand-dark border-b border-gray-800/50">
          {loadError && (
            <p className="text-red-400 text-sm mb-3" role="alert">
              {loadError}
            </p>
          )}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-white">
              {loading
                ? "Buscando…"
                : `${products.length} resultado${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "w-8 h-8 rounded-md border flex items-center justify-center shadow-sm transition-colors",
                  viewMode === "grid"
                    ? "bg-brand-gray border-gray-700 text-white"
                    : "bg-transparent text-brand-muted hover:text-white border-transparent",
                )}
                aria-label="Grade"
                aria-pressed={viewMode === "grid"}
              >
                <i className="fa-solid fa-border-all" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
                  viewMode === "list"
                    ? "bg-brand-gray border-gray-700 text-white shadow-sm"
                    : "bg-transparent text-brand-muted hover:text-white border-transparent",
                )}
                aria-label="Lista"
                aria-pressed={viewMode === "list"}
              >
                <i className="fa-solid fa-list" />
              </button>
            </div>
          </div>
        </div>

        <section
          id="results-area"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 lg:px-16 py-4 pb-28 bg-brand-dark"
          aria-label="Lista de produtos"
        >
          {loading && products.length === 0 ? (
            <div className="flex justify-center py-20 text-brand-muted text-sm">
              Carregando catálogo…
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-brand-muted text-sm">
              Nenhum produto encontrado com os filtros atuais.
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {products.map((p, index) => (
                <ExploreProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAdd}
                  isAdding={addingProductId === p.id}
                  highlightBestseller={index === 0}
                  layout={viewMode}
                />
              ))}
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="w-full flex justify-center mt-12 mb-4">
              <button
                type="button"
                className="px-8 py-3 rounded-xl border border-gray-700 bg-brand-gray text-white font-bold hover:border-gray-600 hover:shadow-sm transition-all duration-200 shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="Paginação virá em uma próxima iteração"
              >
                Carregar mais resultados
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6 pt-2 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent">
        <div className="pointer-events-auto glass-panel px-6 py-3 rounded-full shadow-soft flex items-center gap-6 border border-gray-700 max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-sm font-semibold text-white whitespace-nowrap">
            Chat ativo
          </span>
        </div>
        <div className="w-px h-6 bg-gray-700 shrink-0" />
        <button
          type="button"
          onClick={onBackToChat}
          className="text-sm font-bold text-brand-blue hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <i className="fa-solid fa-arrow-left" />
          Voltar para a conversa
        </button>
        </div>
      </div>
    </div>
  );
};
