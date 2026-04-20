/** Produto retornado por GET /api/products ou /api/products/search */
export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  brand: string | null;
  imageUrl: string | null;
};

export type ExploreSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "top_rated";

export type ExploreAvailabilityFilter = "all" | "in_stock" | "low_stock";

/** Filtro de entrega: MVP usa regra de preço para “frete grátis” no card */
export type ExploreDeliveryFilter = "all" | "free_shipping_eligible";
