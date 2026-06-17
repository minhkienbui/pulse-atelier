import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  BrandDto,
  CatalogPageData,
  CategoryDto,
  HomeCatalogData,
  ProductBadge,
  ProductCardDto,
  ProductDetailDto,
} from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

const watchInclude = {
  brand: {
    select: {
      name: true,
      slug: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.WatchInclude;

type WatchWithRelations = Prisma.WatchGetPayload<{
  include: typeof watchInclude;
}>;

function firstParam(
  searchParams: SearchParams | undefined,
  key: string
): string | undefined {
  const value = searchParams?.[key];

  if (Array.isArray(value)) return value[0];
  return value;
}

function toVndInteger(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

function getBadge(watch: {
  isLimited: boolean;
  originalPrice: number | null;
  price: number;
  soldCount: number;
  createdAt: Date;
}): ProductBadge {
  if (watch.isLimited) return "Limited Edition";
  if (watch.originalPrice && watch.originalPrice > watch.price) return "Sale";
  if (watch.soldCount >= 30) return "Best Seller";

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (watch.createdAt.getTime() >= thirtyDaysAgo) return "New Arrival";

  return null;
}

function mapBrand(brand: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  foundedYear: number | null;
}): BrandDto {
  return brand;
}

function mapCategory(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}): CategoryDto {
  return category;
}

export function mapWatchToCard(watch: WatchWithRelations): ProductCardDto {
  return {
    id: watch.id,
    sku: watch.sku,
    name: watch.name,
    slug: watch.slug,
    price: toVndInteger(watch.price) ?? 0,
    originalPrice: toVndInteger(watch.originalPrice),
    stock: watch.stock,
    soldCount: watch.soldCount,
    isFeatured: watch.isFeatured,
    isLimited: watch.isLimited,
    images: watch.images,
    movement: watch.movement,
    caseSize: watch.caseSize,
    brandId: watch.brandId,
    categoryId: watch.categoryId,
    brand: watch.brand,
    category: watch.category,
    badge: getBadge(watch),
  };
}

function mapWatchToDetail(
  watch: WatchWithRelations & {
    reviews: { rating: number }[];
    _count: { reviews: number };
  }
): ProductDetailDto {
  const totalRating = watch.reviews.reduce(
    (total, review) => total + review.rating,
    0
  );

  return {
    ...mapWatchToCard(watch),
    description: watch.description,
    caseMaterial: watch.caseMaterial,
    dialColor: watch.dialColor,
    waterResistance: watch.waterResistance,
    strapMaterial: watch.strapMaterial,
    warranty: watch.warranty,
    reviewCount: watch._count.reviews,
    averageRating:
      watch._count.reviews > 0 ? totalRating / watch._count.reviews : 0,
  };
}

export async function getHomeCatalogData(): Promise<HomeCatalogData> {
  const baseWhere = {
    isActive: true,
    stock: { gt: 0 },
  } satisfies Prisma.WatchWhereInput;

  const [brands, featuredWatches, bestSellers, saleWatches] =
    await Promise.all([
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          country: true,
          foundedYear: true,
        },
      }),
      prisma.watch.findMany({
        where: { ...baseWhere, isFeatured: true },
        include: watchInclude,
        orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
      prisma.watch.findMany({
        where: baseWhere,
        include: watchInclude,
        orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
      prisma.watch.findMany({
        where: {
          ...baseWhere,
          originalPrice: { not: null },
        },
        include: watchInclude,
        orderBy: [{ updatedAt: "desc" }],
        take: 8,
      }),
    ]);

  return {
    brands: brands.map(mapBrand),
    featuredWatches: featuredWatches.map(mapWatchToCard),
    bestSellers: bestSellers.map(mapWatchToCard),
    saleWatches: saleWatches
      .filter((watch) => watch.originalPrice && watch.originalPrice > watch.price)
      .map(mapWatchToCard),
  };
}

export async function getActiveBrands(): Promise<BrandDto[]> {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      country: true,
      foundedYear: true,
    },
  });

  return brands.map(mapBrand);
}

export async function getCatalogPageData(
  searchParams?: SearchParams
): Promise<CatalogPageData> {
  const query = firstParam(searchParams, "q")?.trim();
  const brand = firstParam(searchParams, "brand");
  const category = firstParam(searchParams, "category");
  const movement = firstParam(searchParams, "movement");
  const sort = firstParam(searchParams, "sort") || "newest";
  const minPrice = Number(firstParam(searchParams, "minPrice"));
  const maxPrice = Number(firstParam(searchParams, "maxPrice"));

  const where: Prisma.WatchWhereInput = {
    isActive: true,
    stock: { gt: 0 },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(movement ? { movement } : {}),
    ...(Number.isFinite(minPrice) || Number.isFinite(maxPrice)
      ? {
          price: {
            ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
            ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.WatchOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: "asc" }]
      : sort === "price-desc"
        ? [{ price: "desc" }]
        : sort === "bestseller"
          ? [{ soldCount: "desc" }]
          : sort === "name-asc"
            ? [{ name: "asc" }]
            : [{ createdAt: "desc" }];

  const [watches, total, brands, categories, movementRows] =
    await Promise.all([
      prisma.watch.findMany({
        where,
        include: watchInclude,
        orderBy,
      }),
      prisma.watch.count({ where }),
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          country: true,
          foundedYear: true,
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
        },
      }),
      prisma.watch.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
          movement: { not: null },
        },
        distinct: ["movement"],
        select: { movement: true },
        orderBy: { movement: "asc" },
      }),
    ]);

  return {
    watches: watches.map(mapWatchToCard),
    total,
    brands: brands.map(mapBrand),
    categories: categories.map(mapCategory),
    movements: movementRows
      .map((row) => row.movement)
      .filter((value): value is string => Boolean(value)),
  };
}

export async function getWatchBySlug(
  slug: string
): Promise<ProductDetailDto | null> {
  const watch = await prisma.watch.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      ...watchInclude,
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  return watch ? mapWatchToDetail(watch) : null;
}

export async function getRelatedWatches(
  watchId: string,
  brandId: string,
  categoryId: string
): Promise<ProductCardDto[]> {
  const watches = await prisma.watch.findMany({
    where: {
      id: { not: watchId },
      isActive: true,
      stock: { gt: 0 },
      OR: [{ brandId }, { categoryId }],
    },
    include: watchInclude,
    orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }],
    take: 4,
  });

  return watches.map(mapWatchToCard);
}
