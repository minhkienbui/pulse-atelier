-- ==========================================
-- Tempus.vn - Luxury Watch E-Commerce Database Schema
-- DBMS: PostgreSQL (designed for Neon DB Serverless)
-- Generated from Prisma Schema and ERD requirements
-- ==========================================

-- Drop existing tables/enums if they exist (clean setup)
DROP TABLE IF EXISTS "service_requests" CASCADE;
DROP TABLE IF EXISTS "blogs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "wishlists" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;
DROP TABLE IF EXISTS "inventory_transactions" CASCADE;
DROP TABLE IF EXISTS "suppliers" CASCADE;
DROP TABLE IF EXISTS "watches" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "CouponType" CASCADE;
DROP TYPE IF EXISTS "TransactionType" CASCADE;
DROP TYPE IF EXISTS "ServiceStatus" CASCADE;

-- ==========================================
-- 1. ENUMS (Custom Data Types)
-- ==========================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'BANK_TRANSFER', 'INSTALLMENT');
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE "TransactionType" AS ENUM ('IMPORT', 'EXPORT', 'ADJUSTMENT');
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- ==========================================
-- 2. USER & AUTH TABLES (NextAuth v5)
-- ==========================================

CREATE TABLE "users" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    "image" TEXT,
    "password" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "accounts" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(255),
    "scope" VARCHAR(255),
    "id_token" TEXT,
    "session_state" VARCHAR(255),
    CONSTRAINT "fk_account_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_provider_providerAccountId" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "sessions" (
    "id" VARCHAR(255) PRIMARY KEY,
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "fk_session_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "uq_identifier_token" UNIQUE ("identifier", "token")
);

-- ==========================================
-- 3. PRODUCT CATALOG TABLES
-- ==========================================

CREATE TABLE "brands" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "country" VARCHAR(100),
    "foundedYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "categories" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_category_parent" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL
);

CREATE TABLE "watches" (
    "id" VARCHAR(255) PRIMARY KEY,
    "sku" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isLimited" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "images" TEXT[] NOT NULL,
    "movement" VARCHAR(100),
    "caseMaterial" VARCHAR(100),
    "dialColor" VARCHAR(100),
    "waterResistance" VARCHAR(100),
    "caseSize" VARCHAR(50),
    "strapMaterial" VARCHAR(100),
    "warranty" INTEGER,
    "brandId" VARCHAR(255) NOT NULL,
    "categoryId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_watch_brand" FOREIGN KEY ("brandId") REFERENCES "brands"("id"),
    CONSTRAINT "fk_watch_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
);

-- ==========================================
-- 4. SUPPLIER & INVENTORY
-- ==========================================

CREATE TABLE "suppliers" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "contactEmail" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "inventory_transactions" (
    "id" VARCHAR(255) PRIMARY KEY,
    "watchId" VARCHAR(255) NOT NULL,
    "supplierId" VARCHAR(255),
    "type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "serialNumber" VARCHAR(100),
    "note" TEXT,
    "createdBy" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_inv_watch" FOREIGN KEY ("watchId") REFERENCES "watches"("id"),
    CONSTRAINT "fk_inv_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL
);

-- ==========================================
-- 5. ORDERS & COUPONS
-- ==========================================

CREATE TABLE "coupons" (
    "id" VARCHAR(255) PRIMARY KEY,
    "code" VARCHAR(100) UNIQUE NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "orders" (
    "id" VARCHAR(255) PRIMARY KEY,
    "orderNumber" VARCHAR(100) UNIQUE NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "couponId" VARCHAR(255),
    "shippingName" VARCHAR(255),
    "shippingPhone" VARCHAR(50),
    "shippingAddress" TEXT,
    "shippingEmail" VARCHAR(255),
    "note" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_order_user" FOREIGN KEY ("userId") REFERENCES "users"("id"),
    CONSTRAINT "fk_order_coupon" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL
);

CREATE TABLE "order_items" (
    "id" VARCHAR(255) PRIMARY KEY,
    "orderId" VARCHAR(255) NOT NULL,
    "watchId" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "serialNumber" VARCHAR(100),
    CONSTRAINT "fk_item_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_item_watch" FOREIGN KEY ("watchId") REFERENCES "watches"("id")
);

-- ==========================================
-- 6. REVIEWS & WISHLISTS
-- ==========================================

CREATE TABLE "reviews" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "watchId" VARCHAR(255) NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT FALSE,
    "adminReply" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_review_user" FOREIGN KEY ("userId") REFERENCES "users"("id"),
    CONSTRAINT "fk_review_watch" FOREIGN KEY ("watchId") REFERENCES "watches"("id")
);

CREATE TABLE "wishlists" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "watchId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_wish_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_wish_watch" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_user_watch_wishlist" UNIQUE ("userId", "watchId")
);

-- ==========================================
-- 7. NOTIFICATIONS, BLOGS & SERVICE SYSTEM
-- ==========================================

CREATE TABLE "notifications" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(100), -- ORDER, SYSTEM, PROMOTION
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_notif_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "blogs" (
    "id" VARCHAR(255) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "authorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_blog_author" FOREIGN KEY ("authorId") REFERENCES "users"("id")
);

CREATE TABLE "service_requests" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "watchInfo" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedCost" DOUBLE PRECISION,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_service_user" FOREIGN KEY ("userId") REFERENCES "users"("id")
);

-- ==========================================
-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX "idx_watches_brand" ON "watches"("brandId");
CREATE INDEX "idx_watches_category" ON "watches"("categoryId");
CREATE INDEX "idx_orders_user" ON "orders"("userId");
CREATE INDEX "idx_order_items_order" ON "order_items"("orderId");
CREATE INDEX "idx_reviews_watch" ON "reviews"("watchId");
CREATE INDEX "idx_blogs_author" ON "blogs"("authorId");
CREATE INDEX "idx_service_requests_user" ON "service_requests"("userId");
