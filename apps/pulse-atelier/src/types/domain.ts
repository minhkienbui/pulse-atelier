export type ProductCategory = "watch" | "earbuds" | "band" | "tablet" | "accessory";
export type Ecosystem = "ios" | "android" | "windows" | "cross-platform";
export type UseCase =
  | "work"
  | "fitness"
  | "travel"
  | "study"
  | "focus"
  | "gaming"
  | "everyday"
  | "entertainment";

export type ProductBadge = "New" | "Best fit" | "Save" | "Limited" | "Pro pick";
export type ProductStatus = "active" | "draft";
export type OrderStatus = "pending" | "confirmed" | "packed" | "shipping" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "cod" | "bank" | "card";
export type TicketStatus = "open" | "in-progress" | "resolved";
export type ReviewStatus = "pending" | "published" | "hidden";
export type CouponType = "percent" | "fixed";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  summary: string;
}

export interface Category {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured: boolean;
  status: ProductStatus;
  badges: ProductBadge[];
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  ecosystems: Ecosystem[];
  useCases: UseCase[];
  compatibilityNotes: string[];
  batteryHours: number;
  connectivity: string[];
  waterResistance?: string;
  sensors: string[];
  anc?: boolean;
  weightGrams?: number;
  warrantyMonths: number;
  bundleProductIds: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: "New" | "Loyal" | "VIP";
  address: string;
  lifetimeSpend: number;
  wishlistProductIds: string[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  items: OrderItem[];
  shippingAddress: string;
  note: string;
  createdAt: string;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  total?: number;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  usageCount: number;
  usageLimit: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  productId?: string;
  subject: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  assignedTo: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  productId: string;
}
