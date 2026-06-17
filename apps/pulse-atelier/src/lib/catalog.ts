import { products } from "@/data/products";
import type { Ecosystem, Product, ProductCategory, UseCase } from "@/types/domain";

export type CatalogSort = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "battery" | "popular";

export interface CatalogFilters {
  query?: string;
  categoryIds?: ProductCategory[];
  brandIds?: string[];
  ecosystems?: Ecosystem[];
  useCases?: UseCase[];
  minPrice?: number;
  maxPrice?: number;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug && product.status === "active") ?? null;
}

export function filterProducts(source: Product[], filters: CatalogFilters) {
  const query = filters.query?.trim().toLowerCase();

  return source.filter((product) => {
    if (product.status !== "active") return false;
    if (query) {
      const haystack = [
        product.name,
        product.shortDescription,
        product.description,
        product.sku,
        ...product.sensors,
        ...product.compatibilityNotes,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.categoryIds?.length && !filters.categoryIds.includes(product.categoryId)) return false;
    if (filters.brandIds?.length && !filters.brandIds.includes(product.brandId)) return false;
    if (filters.ecosystems?.length && !filters.ecosystems.some((item) => product.ecosystems.includes(item))) return false;
    if (filters.useCases?.length && !filters.useCases.some((item) => product.useCases.includes(item))) return false;
    if (typeof filters.minPrice === "number" && product.price < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && product.price > filters.maxPrice) return false;
    return true;
  });
}

export function sortProducts(source: Product[], sort: CatalogSort) {
  return [...source].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "battery") return b.batteryHours - a.batteryHours;
    if (sort === "popular") return b.soldCount - a.soldCount;
    if (sort === "newest") return b.id.localeCompare(a.id);
    return Number(b.isFeatured) - Number(a.isFeatured);
  });
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.status === "active")
    .filter(
      (candidate) =>
        candidate.categoryId === product.categoryId ||
        candidate.useCases.some((item) => product.useCases.includes(item)),
    )
    .slice(0, 4);
}
