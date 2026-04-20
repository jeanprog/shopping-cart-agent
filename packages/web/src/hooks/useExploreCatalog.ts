import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CatalogProduct,
  ExploreAvailabilityFilter,
  ExploreDeliveryFilter,
  ExploreSortOption,
} from "../types/catalog";
import { searchCatalogProducts } from "../services/catalogApi";

export type PriceTierFilter = "all" | "under_300" | "range_300_800" | "over_800";

const FREE_SHIPPING_MIN_CENTS = 500_00;

function applyClientFilters(
  list: CatalogProduct[],
  opts: {
    brand: string | null;
    priceTier: PriceTierFilter;
    availability: ExploreAvailabilityFilter;
    delivery: ExploreDeliveryFilter;
  },
): CatalogProduct[] {
  return list.filter((p) => {
    if (opts.brand) {
      const b = p.brand?.toLowerCase() ?? "";
      if (!b.includes(opts.brand.toLowerCase())) return false;
    }
    if (opts.priceTier === "under_300" && p.priceCents >= 300_00) return false;
    if (
      opts.priceTier === "range_300_800" &&
      (p.priceCents < 300_00 || p.priceCents > 800_00)
    )
      return false;
    if (opts.priceTier === "over_800" && p.priceCents <= 800_00) return false;

    if (opts.availability === "in_stock" && p.stock <= 0) return false;
    if (opts.availability === "low_stock" && (p.stock <= 0 || p.stock >= 5))
      return false;

    if (
      opts.delivery === "free_shipping_eligible" &&
      p.priceCents < FREE_SHIPPING_MIN_CENTS
    )
      return false;

    return true;
  });
}

function sortProducts(
  list: CatalogProduct[],
  sort: ExploreSortOption,
): CatalogProduct[] {
  const next = [...list];
  switch (sort) {
    case "price_asc":
      return next.sort((a, b) => a.priceCents - b.priceCents);
    case "price_desc":
      return next.sort((a, b) => b.priceCents - a.priceCents);
    case "top_rated":
      return next.sort((a, b) => b.stock - a.stock);
    case "relevance":
    default:
      return next;
  }
}

export function useExploreCatalog() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [rawProducts, setRawProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [priceTier, setPriceTier] = useState<PriceTierFilter>("all");
  const [availability, setAvailability] =
    useState<ExploreAvailabilityFilter>("all");
  const [delivery, setDelivery] = useState<ExploreDeliveryFilter>("all");
  const [sort, setSort] = useState<ExploreSortOption>("relevance");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await searchCatalogProducts(debouncedQuery);
      setRawProducts(data);
    } catch {
      setLoadError("Não foi possível carregar o catálogo.");
      setRawProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const filteredProducts = useMemo(() => {
    const filtered = applyClientFilters(rawProducts, {
      brand: brandFilter,
      priceTier,
      availability,
      delivery,
    });
    return sortProducts(filtered, sort);
  }, [
    rawProducts,
    brandFilter,
    priceTier,
    availability,
    delivery,
    sort,
  ]);

  const clearBrandFilter = useCallback(() => setBrandFilter(null), []);

  return {
    query,
    setQuery,
    loading,
    loadError,
    refetch,
    products: filteredProducts,
    totalRaw: rawProducts.length,
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
  };
}
