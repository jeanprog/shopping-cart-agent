import type { CatalogProduct } from "../types/catalog";
import { api } from "./api";

/** Resposta bruta do Drizzle (camelCase no schema) */
type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  brand: string | null;
  imageUrl: string | null;
};

type SearchResponse = {
  success?: boolean;
  products?: ProductRow[];
  error?: string;
};

function mapRow(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price,
    stock: row.stock,
    brand: row.brand,
    imageUrl: row.imageUrl,
  };
}

export async function fetchAllCatalogProducts(): Promise<CatalogProduct[]> {
  const rows = await api.get<ProductRow[]>("/api/products");
  return rows.map(mapRow);
}

export async function searchCatalogProducts(
  query: string,
): Promise<CatalogProduct[]> {
  const q = query.trim();
  if (!q) {
    return fetchAllCatalogProducts();
  }
  const data = await api.get<SearchResponse>(
    `/api/products/search?q=${encodeURIComponent(q)}`,
  );
  if (!data.success || !data.products) {
    return [];
  }
  return data.products.map(mapRow);
}
