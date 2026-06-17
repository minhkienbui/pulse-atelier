"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { coupons, inventoryMovements, reviews, supportTickets } from "@/data/admin";
import { articles, heroBanners } from "@/data/content";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import type {
  Article,
  Coupon,
  CouponType,
  Customer,
  HeroBanner,
  InventoryMovement,
  Order,
  OrderStatus,
  Product,
  ProductBadge,
  ProductCategory,
  ProductStatus,
  Review,
  ReviewStatus,
  SupportTicket,
  TicketStatus,
} from "@/types/domain";

export interface StoreSettings {
  storeName: string;
  shippingFee: number;
  returnPolicy: string;
  warrantyCopy: string;
  paymentLabels: string[];
}

export interface ProductCreateInput {
  sku: string;
  name: string;
  categoryId: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  badges?: ProductBadge[];
}

export interface CustomerCreateInput {
  name: string;
  email: string;
  phone: string;
  segment: Customer["segment"];
  address: string;
}

export interface CouponCreateInput {
  code: string;
  type: CouponType;
  value: number;
  usageLimit: number;
  active: boolean;
}

export interface ReviewCreateInput {
  productId: string;
  customerId: string;
  rating: number;
  content: string;
  status: ReviewStatus;
}

export interface TicketCreateInput {
  customerId: string;
  productId?: string;
  subject: string;
  status: TicketStatus;
  priority: SupportTicket["priority"];
  assignedTo: string;
}

export interface InventoryMovementCreateInput {
  productId: string;
  type: InventoryMovement["type"];
  quantity: number;
  reason: string;
}

export interface ArticleCreateInput {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published: boolean;
}

export interface HeroBannerCreateInput {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  productId: string;
}

interface AdminState {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  inventoryMovements: InventoryMovement[];
  reviews: Review[];
  tickets: SupportTicket[];
  coupons: Coupon[];
  articles: Article[];
  heroBanners: HeroBanner[];
  settings: StoreSettings;
  addProduct: (input: ProductCreateInput) => void;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (input: CustomerCreateInput) => void;
  updateCustomer: (customerId: string, patch: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  addCoupon: (input: CouponCreateInput) => void;
  updateCoupon: (couponId: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (couponId: string) => void;
  addReview: (input: ReviewCreateInput) => void;
  updateReview: (reviewId: string, patch: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  addTicket: (input: TicketCreateInput) => void;
  updateTicket: (ticketId: string, patch: Partial<SupportTicket>) => void;
  deleteTicket: (ticketId: string) => void;
  addInventoryMovement: (input: InventoryMovementCreateInput) => void;
  updateInventoryMovement: (movementId: string, patch: Partial<InventoryMovement>) => void;
  deleteInventoryMovement: (movementId: string) => void;
  addArticle: (input: ArticleCreateInput) => void;
  updateArticle: (articleId: string, patch: Partial<Article>) => void;
  deleteArticle: (articleId: string) => void;
  addHeroBanner: (input: HeroBannerCreateInput) => void;
  updateHeroBanner: (heroId: string, patch: Partial<HeroBanner>) => void;
  deleteHeroBanner: (heroId: string) => void;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  updateProductStock: (productId: string, stock: number) => void;
  updateProductBadges: (productId: string, badges: ProductBadge[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  toggleCoupon: (couponId: string) => void;
  reset: () => void;
}

function nextId(prefix: string, existingLength: number) {
  return `${prefix}-${String(existingLength + 1).padStart(3, "0")}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneProduct(product: Product): Product {
  return {
    ...product,
    badges: [...product.badges],
    gallery: [...product.gallery],
    ecosystems: [...product.ecosystems],
    useCases: [...product.useCases],
    compatibilityNotes: [...product.compatibilityNotes],
    connectivity: [...product.connectivity],
    sensors: [...product.sensors],
    bundleProductIds: [...product.bundleProductIds],
  };
}

function cloneOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
}

function cloneCustomer(customer: Customer): Customer {
  return {
    ...customer,
    wishlistProductIds: [...customer.wishlistProductIds],
  };
}

function defaultSettings(): StoreSettings {
  return {
    storeName: "Pulse Atelier",
    shippingFee: 45_000,
    returnPolicy: "Doi tra trong 7 ngay voi san pham con nguyen phu kien.",
    warrantyCopy: "Bao hanh 12-24 thang tuy dong san pham, hien ro o tung SKU.",
    paymentLabels: ["Thanh toan khi nhan hang", "Chuyen khoan ngan hang", "The ngan hang"],
  };
}

function initialState() {
  return {
    products: products.map(cloneProduct),
    orders: orders.map(cloneOrder),
    customers: customers.map(cloneCustomer),
    inventoryMovements: inventoryMovements.map((movement) => ({ ...movement })),
    reviews: reviews.map((review) => ({ ...review })),
    tickets: supportTickets.map((ticket) => ({ ...ticket })),
    coupons: coupons.map((coupon) => ({ ...coupon })),
    articles: articles.map((article) => ({ ...article })),
    heroBanners: heroBanners.map((hero) => ({ ...hero })),
    settings: defaultSettings(),
  };
}

function createProduct(input: ProductCreateInput, existingLength: number): Product {
  const fallback = products[0];

  return {
    ...fallback,
    id: nextId("prod-custom", existingLength),
    sku: input.sku,
    name: input.name,
    slug: slugify(input.name) || nextId("product", existingLength),
    categoryId: input.categoryId,
    price: input.price,
    originalPrice: undefined,
    stock: Math.max(0, input.stock),
    lowStockThreshold: 5,
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    isFeatured: false,
    status: input.status,
    badges: input.badges ?? [],
    image: fallback.image,
    gallery: [...fallback.gallery],
    shortDescription: input.name,
    description: input.name,
    ecosystems: ["cross-platform"],
    useCases: ["everyday"],
    compatibilityNotes: [],
    batteryHours: 0,
    connectivity: [],
    sensors: [],
    anc: false,
    weightGrams: undefined,
    warrantyMonths: 12,
    bundleProductIds: [],
  };
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      ...initialState(),
      addProduct: (input) =>
        set((state) => ({
          products: [createProduct(input, state.products.length), ...state.products],
        })),
      updateProduct: (productId, patch) =>
        set((state) => ({
          products: state.products.map((product) => (product.id === productId ? { ...product, ...patch } : product)),
        })),
      deleteProduct: (productId) =>
        set((state) => ({ products: state.products.filter((product) => product.id !== productId) })),
      addCustomer: (input) =>
        set((state) => ({
          customers: [
            {
              ...input,
              id: nextId("cust-custom", state.customers.length),
              lifetimeSpend: 0,
              wishlistProductIds: [],
            },
            ...state.customers,
          ],
        })),
      updateCustomer: (customerId, patch) =>
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, ...patch } : customer,
          ),
        })),
      deleteCustomer: (customerId) =>
        set((state) => ({ customers: state.customers.filter((customer) => customer.id !== customerId) })),
      addOrder: (order) => set((state) => ({ orders: [cloneOrder(order), ...state.orders] })),
      updateOrder: (orderId, patch) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)),
        })),
      deleteOrder: (orderId) => set((state) => ({ orders: state.orders.filter((order) => order.id !== orderId) })),
      addCoupon: (input) =>
        set((state) => ({
          coupons: [
            {
              ...input,
              id: nextId("coupon-custom", state.coupons.length),
              code: input.code.trim().toUpperCase(),
              usageCount: 0,
              startsAt: new Date().toISOString(),
              endsAt: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            },
            ...state.coupons,
          ],
        })),
      updateCoupon: (couponId, patch) =>
        set((state) => ({
          coupons: state.coupons.map((coupon) => (coupon.id === couponId ? { ...coupon, ...patch } : coupon)),
        })),
      deleteCoupon: (couponId) =>
        set((state) => ({ coupons: state.coupons.filter((coupon) => coupon.id !== couponId) })),
      addReview: (input) =>
        set((state) => ({
          reviews: [
            {
              ...input,
              id: nextId("rev-custom", state.reviews.length),
              rating: Math.min(5, Math.max(1, input.rating)),
              createdAt: new Date().toISOString(),
            },
            ...state.reviews,
          ],
        })),
      updateReview: (reviewId, patch) =>
        set((state) => ({
          reviews: state.reviews.map((review) => (review.id === reviewId ? { ...review, ...patch } : review)),
        })),
      deleteReview: (reviewId) =>
        set((state) => ({ reviews: state.reviews.filter((review) => review.id !== reviewId) })),
      addTicket: (input) =>
        set((state) => ({
          tickets: [
            {
              ...input,
              id: nextId("ticket-custom", state.tickets.length),
              createdAt: new Date().toISOString(),
            },
            ...state.tickets,
          ],
        })),
      updateTicket: (ticketId, patch) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...patch } : ticket)),
        })),
      deleteTicket: (ticketId) =>
        set((state) => ({ tickets: state.tickets.filter((ticket) => ticket.id !== ticketId) })),
      addInventoryMovement: (input) =>
        set((state) => ({
          inventoryMovements: [
            {
              ...input,
              id: nextId("inv-custom", state.inventoryMovements.length),
              createdAt: new Date().toISOString(),
            },
            ...state.inventoryMovements,
          ],
        })),
      updateInventoryMovement: (movementId, patch) =>
        set((state) => ({
          inventoryMovements: state.inventoryMovements.map((movement) =>
            movement.id === movementId ? { ...movement, ...patch } : movement,
          ),
        })),
      deleteInventoryMovement: (movementId) =>
        set((state) => ({
          inventoryMovements: state.inventoryMovements.filter((movement) => movement.id !== movementId),
        })),
      addArticle: (input) =>
        set((state) => ({
          articles: [
            {
              ...input,
              id: nextId("article-custom", state.articles.length),
            },
            ...state.articles,
          ],
        })),
      updateArticle: (articleId, patch) =>
        set((state) => ({
          articles: state.articles.map((article) => (article.id === articleId ? { ...article, ...patch } : article)),
        })),
      deleteArticle: (articleId) =>
        set((state) => ({ articles: state.articles.filter((article) => article.id !== articleId) })),
      addHeroBanner: (input) =>
        set((state) => ({
          heroBanners: [
            {
              ...input,
              id: nextId("hero-custom", state.heroBanners.length),
            },
            ...state.heroBanners,
          ],
        })),
      updateHeroBanner: (heroId, patch) =>
        set((state) => ({
          heroBanners: state.heroBanners.map((hero) => (hero.id === heroId ? { ...hero, ...patch } : hero)),
        })),
      deleteHeroBanner: (heroId) =>
        set((state) => ({ heroBanners: state.heroBanners.filter((hero) => hero.id !== heroId) })),
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      updateProductStatus: (productId, status) =>
        set((state) => ({
          products: state.products.map((product) => (product.id === productId ? { ...product, status } : product)),
        })),
      updateProductStock: (productId, stock) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, stock: Math.max(0, stock) } : product,
          ),
        })),
      updateProductBadges: (productId, badges) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, badges: [...badges] } : product,
          ),
        })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        })),
      updateReviewStatus: (reviewId, status) =>
        set((state) => ({
          reviews: state.reviews.map((review) => (review.id === reviewId ? { ...review, status } : review)),
        })),
      updateTicketStatus: (ticketId, status) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
        })),
      toggleCoupon: (couponId) =>
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon,
          ),
        })),
      reset: () => set(initialState()),
    }),
    { name: "pulse-admin-state" },
  ),
);
