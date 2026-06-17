import type { OrderStatus, PaymentMethod, Role } from "@prisma/client";

export type ProductBadge =
  | "Limited Edition"
  | "New Arrival"
  | "Best Seller"
  | "Sale"
  | null;

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  foundedYear: number | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface ProductCardDto {
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
  images: string[];
  movement: string | null;
  caseSize: string | null;
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
  badge: ProductBadge;
}

export interface ProductDetailDto extends ProductCardDto {
  description: string | null;
  caseMaterial: string | null;
  dialColor: string | null;
  waterResistance: string | null;
  strapMaterial: string | null;
  warranty: number | null;
  reviewCount: number;
  averageRating: number;
}

export interface HomeCatalogData {
  brands: BrandDto[];
  featuredWatches: ProductCardDto[];
  bestSellers: ProductCardDto[];
  saleWatches: ProductCardDto[];
}

export interface CatalogPageData {
  watches: ProductCardDto[];
  brands: BrandDto[];
  categories: CategoryDto[];
  movements: string[];
  total: number;
}

export interface CartValidationItem {
  watchId: string;
  quantity: number;
}

export interface ValidatedCartItem {
  watchId: string;
  quantity: number;
  price: number;
  subtotal: number;
  watch: ProductCardDto;
}

export interface CartValidationResult {
  items: ValidatedCartItem[];
  subtotal: number;
  errors: Record<string, string>;
}

export interface CreatePendingOrderInput {
  userId: string;
  items: ValidatedCartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  discount?: number;
  shippingFee?: number;
}

export interface CustomerOrderItemDto {
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

export interface CustomerOrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingEmail: string | null;
  note: string | null;
  createdAt: string;
  items: CustomerOrderItemDto[];
}

export interface CustomerAccountDto {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
  role: Role;
  createdAt: string;
  orderCount: number;
  wishlistCount: number;
}

export interface UpdateCustomerProfileInput {
  name?: string;
  phone?: string;
  address?: string;
}

export interface BlogSummaryDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  views: number;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export interface BlogDetailDto extends BlogSummaryDto {
  content: string;
}
