import React, { useState } from "react";
import type { CatalogProduct } from "../../types/catalog";
import { cn } from "../../lib/utils";
import { formatBRLFromCents } from "../../lib/formatCurrency";

const PLACEHOLDER =
  "https://placehold.co/400x400/111827/6b7280?text=Sem+imagem";

const FREE_SHIPPING_MIN_CENTS = 500_00;

export type ExploreProductCardProps = {
  product: CatalogProduct;
  onAddToCart: (productId: string) => void;
  isAdding: boolean;
  /** Destaque visual no primeiro item (paridade com mock “Mais Vendido”) */
  highlightBestseller?: boolean;
  layout?: "grid" | "list";
};

export const ExploreProductCard: React.FC<ExploreProductCardProps> = ({
  product,
  onAddToCart,
  isAdding,
  highlightBestseller,
  layout = "grid",
}) => {
  const [imgError, setImgError] = useState(false);
  const [wish, setWish] = useState(false);
  const src =
    imgError || !product.imageUrl ? PLACEHOLDER : product.imageUrl;

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock < 5;
  const freeShipping = product.priceCents >= FREE_SHIPPING_MIN_CENTS;

  const isList = layout === "list";

  return (
    <article
      className={cn(
        "glass-panel rounded-[24px] p-4 hover:shadow-glow hover:border-brand-blue transition-all group relative border-gray-800",
        isList
          ? "flex flex-row items-stretch gap-6"
          : "flex flex-col gap-4",
      )}
    >
      {highlightBestseller && (
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            Destaque
          </span>
        </div>
      )}

      <div
        className={cn(
          "bg-brand-gray rounded-xl flex items-center justify-center overflow-hidden relative border border-gray-800 shadow-inner",
          isList
            ? "w-36 sm:w-40 shrink-0 aspect-square mb-0"
            : "w-full aspect-square mb-2",
        )}
      >
        <img
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 mix-blend-screen"
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
          <button
            type="button"
            onClick={() => setWish((w) => !w)}
            className={cn(
              "w-8 h-8 bg-brand-dark border border-gray-700 rounded-full flex items-center justify-center shadow-sm transition-colors",
              wish
                ? "text-red-500"
                : "text-brand-muted hover:text-red-500",
            )}
            title={wish ? "Remover dos salvos" : "Salvar"}
            aria-label={wish ? "Remover dos salvos" : "Salvar"}
          >
            <i
              className={cn(
                wish ? "fa-solid fa-heart" : "fa-regular fa-heart",
              )}
            />
          </button>
          <button
            type="button"
            className="w-8 h-8 bg-brand-dark border border-gray-700 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-blue shadow-sm transition-colors"
            title="Comparar"
            aria-label="Comparar (em breve)"
            disabled
          >
            <i className="fa-solid fa-code-compare" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        {product.brand && (
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
            {product.brand}
          </span>
        )}
        <h3 className="font-bold text-white text-lg leading-tight mt-1 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between pt-4 gap-3">
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-xl text-white tabular-nums">
              {formatBRLFromCents(product.priceCents)}
            </span>
            {outOfStock ? (
              <span className="text-xs text-red-400 font-medium mt-0.5">
                Indisponível
              </span>
            ) : lowStock ? (
              <span className="text-xs text-orange-400 font-medium mt-0.5">
                Últimas unidades
              </span>
            ) : (
              <span className="text-xs text-green-400 font-medium mt-0.5">
                Em estoque
              </span>
            )}
            {freeShipping && (
              <span className="text-xs text-green-400/90 font-medium mt-0.5">
                Frete grátis elegível
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isAdding || outOfStock}
            onClick={() => onAddToCart(product.id)}
            className="w-10 h-10 shrink-0 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center hover:bg-[#d4ed3e] transition-colors shadow-[0_0_10px_rgba(230,255,85,0.2)] disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Adicionar ao carrinho"
          >
            <i className="fa-solid fa-cart-plus" />
          </button>
        </div>
      </div>
    </article>
  );
};
