import "server-only";

import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  adminTextQuerySchema,
  adminOrderQuerySchema,
  adminProductQuerySchema,
} from "@/lib/admin/validation";

const adminOrderInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  items: {
    include: {
      watch: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          brand: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
  payments: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
} satisfies Prisma.OrderInclude;

type AdminOrderRecord = Prisma.OrderGetPayload<{
  include: typeof adminOrderInclude;
}>;

export interface AdminOrderItemDto {
  id: string;
  watchId: string;
  name: string;
  slug: string;
  brand: string;
  image: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AdminOrderDto {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string | null;
  total: number;
  createdAt: string;
  items: AdminOrderItemDto[];
}

export interface AdminOrdersPageData {
  orders: AdminOrderDto[];
  total: number;
  pendingCount: number;
  shippingCount: number;
  completedRevenue: number;
  filters: {
    q?: string;
    status?: OrderStatus;
  };
}

export interface AdminDashboardData {
  revenue: {
    total: number;
    currentMonth: number;
    previousMonth: number;
    changePercent: number;
  };
  orders: {
    total: number;
    currentMonth: number;
    previousMonth: number;
    pending: number;
    changePercent: number;
  };
  customers: {
    total: number;
    currentMonth: number;
    previousMonth: number;
    changePercent: number;
  };
  inventory: {
    products: number;
    stockUnits: number;
    lowStock: number;
    outOfStock: number;
  };
  reviews: {
    pending: number;
  };
  blogs: {
    published: number;
    total: number;
  };
  monthlyRevenue: Array<{
    month: string;
    value: number;
  }>;
  brandRevenue: Array<{
    brand: string;
    value: number;
    percent: number;
  }>;
  recentOrders: AdminOrderDto[];
}

export interface AdminProductDto {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  soldCount: number;
  isFeatured: boolean;
  isLimited: boolean;
  isActive: boolean;
  images: string[];
  movement: string | null;
  caseMaterial: string | null;
  dialColor: string | null;
  waterResistance: string | null;
  caseSize: string | null;
  strapMaterial: string | null;
  warranty: number | null;
  description: string | null;
  brandId: string;
  categoryId: string;
  brand: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

export interface AdminProductsPageData {
  products: AdminProductDto[];
  brands: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  total: number;
  featuredCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  filters: {
    q?: string;
    brandId?: string;
    categoryId?: string;
  };
}

export interface AdminBrandDto {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  foundedYear: number | null;
  isActive: boolean;
  watchCount: number;
  createdAt: string;
}

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  watchCount: number;
  createdAt: string;
}

export interface AdminBrandsPageData {
  brands: AdminBrandDto[];
  total: number;
  activeCount: number;
  filters: {
    q?: string;
  };
}

export interface AdminCategoriesPageData {
  categories: AdminCategoryDto[];
  total: number;
  activeCount: number;
  filters: {
    q?: string;
  };
}

function toInt(value: number | null | undefined) {
  return Math.round(value || 0);
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function mapAdminOrder(order: AdminOrderRecord): AdminOrderDto {
  const items = order.items.map((item) => ({
    id: item.id,
    watchId: item.watchId,
    name: item.watch.name,
    slug: item.watch.slug,
    brand: item.watch.brand.name,
    image: item.watch.images[0] || null,
    quantity: item.quantity,
    price: toInt(item.price),
    subtotal: toInt(item.price * item.quantity),
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.shippingName || order.user.name || order.user.email,
    email: order.shippingEmail || order.user.email,
    phone: order.shippingPhone || order.user.phone,
    address: order.shippingAddress,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.payments[0]?.status || null,
    total: toInt(order.total),
    createdAt: order.createdAt.toISOString(),
    items,
  };
}

function buildOrderWhere(input: unknown): Prisma.OrderWhereInput {
  const filters = adminOrderQuerySchema.parse(input);
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.q) {
    where.OR = [
      { orderNumber: { contains: filters.q, mode: "insensitive" } },
      { shippingName: { contains: filters.q, mode: "insensitive" } },
      { shippingEmail: { contains: filters.q, mode: "insensitive" } },
      { shippingPhone: { contains: filters.q, mode: "insensitive" } },
      { user: { name: { contains: filters.q, mode: "insensitive" } } },
      { user: { email: { contains: filters.q, mode: "insensitive" } } },
      {
        items: {
          some: {
            watch: {
              name: { contains: filters.q, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  return where;
}

function mapAdminProduct(
  product: Prisma.WatchGetPayload<{
    include: {
      brand: { select: { name: true; slug: true } };
      category: { select: { name: true; slug: true } };
    };
  }>
): AdminProductDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    price: toInt(product.price),
    originalPrice:
      product.originalPrice === null ? null : toInt(product.originalPrice),
    stock: product.stock,
    soldCount: product.soldCount,
    isFeatured: product.isFeatured,
    isLimited: product.isLimited,
    isActive: product.isActive,
    images: product.images,
    movement: product.movement,
    caseMaterial: product.caseMaterial,
    dialColor: product.dialColor,
    waterResistance: product.waterResistance,
    caseSize: product.caseSize,
    strapMaterial: product.strapMaterial,
    warranty: product.warranty,
    description: product.description,
    brandId: product.brandId,
    categoryId: product.categoryId,
    brand: product.brand,
    category: product.category,
    createdAt: product.createdAt.toISOString(),
  };
}

function buildProductWhere(input: unknown): Prisma.WatchWhereInput {
  const filters = adminProductQuerySchema.parse(input);
  const where: Prisma.WatchWhereInput = {};

  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
      { brand: { name: { contains: filters.q, mode: "insensitive" } } },
      { category: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

function buildBrandWhere(input: unknown): Prisma.BrandWhereInput {
  const filters = adminTextQuerySchema.parse(input);
  const where: Prisma.BrandWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { slug: { contains: filters.q, mode: "insensitive" } },
      { country: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildCategoryWhere(input: unknown): Prisma.CategoryWhereInput {
  const filters = adminTextQuerySchema.parse(input);
  const where: Prisma.CategoryWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { slug: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getAdminOrdersPageData(
  input: unknown
): Promise<AdminOrdersPageData> {
  const filters = adminOrderQuerySchema.parse(input);
  const where = buildOrderWhere(filters);

  const [orders, total, pendingCount, shippingCount, completedRevenue] =
    await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: adminOrderInclude,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "SHIPPING" } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
      }),
    ]);

  return {
    orders: orders.map(mapAdminOrder),
    total,
    pendingCount,
    shippingCount,
    completedRevenue: toInt(completedRevenue._sum.total),
    filters,
  };
}

export async function getAdminProductsPageData(
  input: unknown
): Promise<AdminProductsPageData> {
  const filters = adminProductQuerySchema.parse(input);
  const where = buildProductWhere(filters);

  const [
    products,
    brands,
    categories,
    total,
    featuredCount,
    lowStockCount,
    outOfStockCount,
  ] = await prisma.$transaction([
    prisma.watch.findMany({
      where,
      include: {
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
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.watch.count({ where }),
    prisma.watch.count({ where: { isFeatured: true, isActive: true } }),
    prisma.watch.count({ where: { isActive: true, stock: { gt: 0, lt: 3 } } }),
    prisma.watch.count({ where: { isActive: true, stock: 0 } }),
  ]);

  return {
    products: products.map(mapAdminProduct),
    brands,
    categories,
    total,
    featuredCount,
    lowStockCount,
    outOfStockCount,
    filters,
  };
}

export async function getAdminBrandsPageData(
  input: unknown
): Promise<AdminBrandsPageData> {
  const filters = adminTextQuerySchema.parse(input);
  const where = buildBrandWhere(filters);
  const [brands, total, activeCount] = await prisma.$transaction([
    prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: {
            watches: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.brand.count({ where }),
    prisma.brand.count({ where: { isActive: true } }),
  ]);

  return {
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      country: brand.country,
      foundedYear: brand.foundedYear,
      isActive: brand.isActive,
      watchCount: brand._count.watches,
      createdAt: brand.createdAt.toISOString(),
    })),
    total,
    activeCount,
    filters,
  };
}

export async function getAdminCategoriesPageData(
  input: unknown
): Promise<AdminCategoriesPageData> {
  const filters = adminTextQuerySchema.parse(input);
  const where = buildCategoryWhere(filters);
  const [categories, total, activeCount] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            watches: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.count({ where }),
    prisma.category.count({ where: { isActive: true } }),
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      watchCount: category._count.watches,
      createdAt: category.createdAt.toISOString(),
    })),
    total,
    activeCount,
    filters,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const thisMonthStart = monthStart(now);
  const lastMonthStart = addMonths(thisMonthStart, -1);
  const nextMonthStart = addMonths(thisMonthStart, 1);
  const firstChartMonth = addMonths(thisMonthStart, -11);

  const [
    totalRevenue,
    currentMonthRevenue,
    previousMonthRevenue,
    totalOrders,
    currentMonthOrders,
    previousMonthOrders,
    pendingOrders,
    totalCustomers,
    currentMonthCustomers,
    previousMonthCustomers,
    productCount,
    stockUnits,
    lowStock,
    outOfStock,
    pendingReviews,
    publishedBlogs,
    totalBlogs,
    recentOrders,
    chartOrders,
  ] = await prisma.$transaction([
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: thisMonthStart, lt: nextMonthStart },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: thisMonthStart, lt: nextMonthStart } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: thisMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
    }),
    prisma.watch.count({ where: { isActive: true } }),
    prisma.watch.aggregate({
      where: { isActive: true },
      _sum: { stock: true },
    }),
    prisma.watch.count({
      where: { isActive: true, stock: { gt: 0, lt: 3 } },
    }),
    prisma.watch.count({
      where: { isActive: true, stock: 0 },
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.blog.count({ where: { isPublished: true } }),
    prisma.blog.count(),
    prisma.order.findMany({
      include: adminOrderInclude,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: firstChartMonth },
      },
      include: {
        items: {
          include: {
            watch: {
              select: {
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
    const date = addMonths(firstChartMonth, index);
    return {
      month: `T${date.getMonth() + 1}`,
      key: `${date.getFullYear()}-${date.getMonth()}`,
      value: 0,
    };
  });
  const revenueByMonth = new Map(monthlyRevenue.map((item) => [item.key, item]));
  const brandTotals = new Map<string, number>();

  for (const order of chartOrders) {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    const month = revenueByMonth.get(key);
    if (month) month.value += toInt(order.total);

    for (const item of order.items) {
      const brand = item.watch.brand.name;
      brandTotals.set(
        brand,
        (brandTotals.get(brand) || 0) + toInt(item.price * item.quantity)
      );
    }
  }

  const totalBrandRevenue = Array.from(brandTotals.values()).reduce(
    (sum, value) => sum + value,
    0
  );
  const brandRevenue = Array.from(brandTotals.entries())
    .sort(([, left], [, right]) => right - left)
    .slice(0, 5)
    .map(([brand, value]) => ({
      brand,
      value,
      percent:
        totalBrandRevenue > 0
          ? Math.round((value / totalBrandRevenue) * 100)
          : 0,
    }));

  return {
    revenue: {
      total: toInt(totalRevenue._sum.total),
      currentMonth: toInt(currentMonthRevenue._sum.total),
      previousMonth: toInt(previousMonthRevenue._sum.total),
      changePercent: percentChange(
        toInt(currentMonthRevenue._sum.total),
        toInt(previousMonthRevenue._sum.total)
      ),
    },
    orders: {
      total: totalOrders,
      currentMonth: currentMonthOrders,
      previousMonth: previousMonthOrders,
      pending: pendingOrders,
      changePercent: percentChange(currentMonthOrders, previousMonthOrders),
    },
    customers: {
      total: totalCustomers,
      currentMonth: currentMonthCustomers,
      previousMonth: previousMonthCustomers,
      changePercent: percentChange(
        currentMonthCustomers,
        previousMonthCustomers
      ),
    },
    inventory: {
      products: productCount,
      stockUnits: stockUnits._sum.stock || 0,
      lowStock,
      outOfStock,
    },
    reviews: {
      pending: pendingReviews,
    },
    blogs: {
      published: publishedBlogs,
      total: totalBlogs,
    },
    monthlyRevenue: monthlyRevenue.map(({ month, value }) => ({
      month,
      value,
    })),
    brandRevenue,
    recentOrders: recentOrders.map(mapAdminOrder),
  };
}
