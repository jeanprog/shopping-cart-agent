import React, { useState } from "react";
import type { ChatProductPreview } from "../../types/chat";
import { Heart, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

const PLACEHOLDER =
  "https://placehold.co/400x400/111827/6b7280?text=Sem+imagem";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type ChatProductCardProps = {
  product: ChatProductPreview;
  onAddToCart: (productId: string) => void;
  isAdding: boolean;
};

const ChatProductCard: React.FC<ChatProductCardProps> = ({
  product,
  onAddToCart,
  isAdding,
}) => {
  const [imgError, setImgError] = useState(false);
  const [wish, setWish] = useState(false);
  const src = imgError || !product.imageUrl ? PLACEHOLDER : product.imageUrl;

  return (
    <article className="glass-panel rounded-[20px] p-3 flex flex-col gap-3 min-w-[200px] max-w-[220px] shrink-0 snap-start border border-gray-800 hover:border-brand-blue/40 transition-colors shadow-soft">
      <div className="relative w-full aspect-square bg-brand-gray rounded-xl overflow-hidden border border-gray-800">
        <button
          type="button"
          onClick={() => setWish((w) => !w)}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-brand-dark/80 border border-gray-700 flex items-center justify-center text-brand-muted hover:text-red-400 transition-colors"
          aria-label="Favoritar"
        >
          <Heart
            className={cn("w-4 h-4", wish && "fill-red-400 text-red-400")}
          />
        </button>
        <img
          src={src}
          alt={product.name}
          className="w-full h-full object-contain p-3 mix-blend-screen"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex flex-col flex-grow gap-1 min-h-0">
        {product.brand && (
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
            {product.brand}
          </span>
        )}
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2 gap-2">
          <span className="font-extrabold text-lg text-white tabular-nums">
            {formatBRL(product.priceCents)}
          </span>
          <button
            type="button"
            disabled={isAdding}
            onClick={() => onAddToCart(product.id)}
            className="w-10 h-10 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center hover:bg-[#d4ed3e] transition-colors shadow-[0_0_12px_rgba(230,255,85,0.25)] disabled:opacity-50 shrink-0"
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </article>
  );
};

type ChatProductCarouselProps = {
  products: ChatProductPreview[];
  onAddToCart: (productId: string) => void;
  addingId: string | null;
};

export const ChatProductCarousel: React.FC<ChatProductCarouselProps> = ({
  products,
  onAddToCart,
  addingId,
}) => {
  if (!products.length) return null;

  return (
    <div className="w-full mt-4 -mx-1 min-w-0 max-w-[min(100%,calc(100vw-3rem))] sm:max-w-none">
      <div className="flex gap-4 pb-3 pt-1 px-1 snap-x snap-mandatory carousel-x-scroll">
        {products.map((p) => (
          <ChatProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
            isAdding={addingId === p.id}
          />
        ))}
      </div>
    </div>
  );
};
