# Connect Neon DB via Prisma ORM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Neon DB (PostgreSQL) using Prisma ORM to replace static typescript mock files, seed initial data, and render the homepage dynamically from the database.

**Architecture:** Use Prisma Client to query the PostgreSQL database. Establish a global Prisma client instance for Next.js hot-reloading stability. Implement a custom seeding script to populate Neon DB with current static mock data.

**Tech Stack:** Next.js (RSC), Prisma ORM, Neon Serverless PostgreSQL.

---

## User Review Required

> [!IMPORTANT]
> The database connection string contains the production credentials for your Neon DB database. Ensure that the database is not in active production use with conflicting schema definitions before running the push command.

---

## Open Questions

*None. The user has provided the Neon DB connection string and approved the Prisma ORM design.*

---

## Proposed Changes

### Database Setup

#### [MODIFY] [package.json](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/package.json)
* Install `@prisma/client` and dev dependencies `prisma`, `tsx`.
* Add the prisma seed configuration script.

#### [NEW] [.env.local](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/.env.local)
* Store `DATABASE_URL` with the Neon DB connection string.

#### [NEW] [schema.prisma](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/schema.prisma)
* Define the database models (Brand, Category, Product, Customer, Order, OrderItem, Review, SupportTicket, Article, HeroBanner, Coupon, InventoryMovement) based on types in `src/types/domain.ts`.

#### [NEW] [db.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/db.ts)
* Set up global Prisma Client instance.

#### [NEW] [seed.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/seed.ts)
* Custom TS script to populate Neon DB using the existing static data files under `src/data/*.ts`.

#### [NEW] [test-connection.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/test-connection.ts)
* Test script to execute query and verify database round-trip.

---

### Frontend Integration

#### [MODIFY] [page.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/app/page.tsx)
* Replace imports from static files with direct async queries using Prisma client for rendering categories, products, articles, and hero banners.

---

## Implementation Tasks

### Task 1: Install Prisma Dependencies

**Files:**
* Modify: [package.json](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/package.json)

- [ ] **Step 1: Install Prisma packages**
  Run command in workspace root:
  ```powershell
  npm install @prisma/client
  npm install -D prisma tsx
  ```
- [ ] **Step 2: Verify package.json contains prisma and tsx**
  Expected: `"@prisma/client"` in `dependencies` and `"prisma"`, `"tsx"` in `devDependencies`.

---

### Task 2: Environment Configuration

**Files:**
* Create: [.env.local](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/.env.local)

- [ ] **Step 1: Create .env.local file**
  Write Neon DB Connection String:
  ```env
  DATABASE_URL="postgresql://neondb_owner:npg_uBnlDZ8NMbU6@ep-lively-wave-aohnq0jf-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  ```
- [ ] **Step 2: Verify file is not staged or visible to Git**
  Expected: `.env.local` is listed in `.gitignore` if it exists. (Next.js automatically gitignores `.env.local`).

---

### Task 3: Define database schema

**Files:**
* Create: [schema.prisma](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/schema.prisma)

- [ ] **Step 1: Create schema.prisma with all model definitions**
  Create the file `prisma/schema.prisma` containing:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  model Brand {
    id        String    @id @default(uuid())
    name      String
    slug      String    @unique
    country   String
    summary   String
    products  Product[]
  }

  model Category {
    id          String    @id
    name        String
    slug        String    @unique
    description String
    products    Product[]
  }

  model Product {
    id                 String     @id @default(uuid())
    sku                String     @unique
    name               String
    slug               String     @unique
    brandId            String
    brand              Brand      @relation(fields: [brandId], references: [id])
    categoryId         String
    category           Category   @relation(fields: [categoryId], references: [id])
    price              Float
    originalPrice      Float?
    stock              Int
    lowStockThreshold  Int        @default(5)
    rating             Float      @default(0.0)
    reviewCount        Int        @default(0)
    soldCount          Int        @default(0)
    isFeatured         Boolean    @default(false)
    status             String     @default("active")
    badges             String[]
    image              String
    gallery            String[]
    shortDescription   String
    description        String
    ecosystems         String[]
    useCases           String[]
    compatibilityNotes String[]
    batteryHours       Float      @default(0.0)
    connectivity       String[]
    waterResistance    String?
    sensors            String[]
    anc                Boolean?
    weightGrams        Float?
    warrantyMonths     Int        @default(12)
    bundleProductIds   String[]
    reviews            Review[]
  }

  model Customer {
    id                 String    @id @default(uuid())
    name               String
    email              String    @unique
    phone              String
    segment            String    @default("New")
    address            String
    lifetimeSpend      Float     @default(0.0)
    wishlistProductIds String[]
    orders             Order[]
    reviews            Review[]
  }

  model Order {
    id              String      @id @default(uuid())
    orderNumber     String      @unique
    customerId      String
    customer        Customer    @relation(fields: [customerId], references: [id])
    status          String      @default("pending")
    paymentStatus   String      @default("pending")
    paymentMethod   String?
    shippingAddress String
    note            String
    createdAt       DateTime    @default(now())
    subtotal        Float       @default(0.0)
    discount        Float       @default(0.0)
    shippingFee     Float       @default(0.0)
    total           Float       @default(0.0)
    items           OrderItem[]
  }

  model OrderItem {
    id        String   @id @default(uuid())
    orderId   String
    order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
    productId String
    quantity  Int
    unitPrice Float
  }

  model Review {
    id         String   @id @default(uuid())
    productId  String
    product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id])
    rating     Int
    content    String
    status     String   @default("pending")
    createdAt  DateTime @default(now())
  }

  model SupportTicket {
    id         String   @id @default(uuid())
    customerId String
    customer   Customer @relation(fields: [customerId], references: [id])
    productId  String?
    subject    String
    status     String   @default("open")
    priority   String   @default("medium")
    assignedTo String
    createdAt  DateTime @default(now())
  }

  model Article {
    id        String   @id @default(uuid())
    title     String
    slug      String   @unique
    excerpt   String
    category  String
    published Boolean  @default(false)
  }

  model HeroBanner {
    id        String   @id @default(uuid())
    title     String
    subtitle  String
    ctaLabel  String
    ctaHref   String
    productId String
  }

  model Coupon {
    id         String   @id @default(uuid())
    code       String   @unique
    type       String
    value      Float
    usageCount Int      @default(0)
    usageLimit Int      @default(100)
    active     Boolean  @default(true)
    startsAt   DateTime
    endsAt     DateTime
  }

  model InventoryMovement {
    id        String   @id @default(uuid())
    productId String
    product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
    type      String   // "in" | "out" | "adjustment"
    quantity  Int
    reason    String
    createdAt DateTime @default(now())
  }
  ```
- [ ] **Step 2: Validate Prisma schema**
  Run command:
  ```powershell
  npx prisma validate
  ```
  Expected: Schema is valid.

---

### Task 4: Push Schema to Neon DB

**Files:**
* None (Database action)

- [ ] **Step 1: Push schema to database**
  Run command:
  ```powershell
  npx prisma db push
  ```
  Expected: "Your database is now in sync with your Prisma schema".

---

### Task 5: Database Client Setup

**Files:**
* Create: [db.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/db.ts)

- [ ] **Step 1: Create db.ts file**
  Create `src/lib/db.ts` with:
  ```typescript
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

  export const db = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
  ```
- [ ] **Step 2: Run Prisma Client generator**
  Run command:
  ```powershell
  npx prisma generate
  ```
  Expected: Prisma Client is generated successfully.

---

### Task 6: Data Seeding Setup

**Files:**
* Create: [seed.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/seed.ts)
* Modify: [package.json](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/package.json)

- [ ] **Step 1: Create prisma/seed.ts file**
  Write TS seed file to read mock files and populate Neon database:
  ```typescript
  import { PrismaClient } from "@prisma/client";
  import { categories } from "../src/data/categories";
  import { brands } from "../src/data/brands";
  import { products } from "../src/data/products";
  import { customers } from "../src/data/customers";
  import { orders } from "../src/data/orders";
  import { articles, heroBanners } from "../src/data/content";
  import { coupons, inventoryMovements, reviews, supportTickets } from "../src/data/admin";

  const prisma = new PrismaClient();

  async function main() {
    console.log("Clearing database...");
    await prisma.inventoryMovement.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.article.deleteMany();
    await prisma.heroBanner.deleteMany();
    await prisma.coupon.deleteMany();

    console.log("Seeding categories...");
    for (const c of categories) {
      await prisma.category.create({
        data: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
        },
      });
    }

    console.log("Seeding brands...");
    for (const b of brands) {
      await prisma.brand.create({
        data: {
          id: b.id,
          name: b.name,
          slug: b.slug,
          country: b.country,
          summary: b.summary,
        },
      });
    }

    console.log("Seeding products...");
    for (const p of products) {
      await prisma.product.create({
        data: {
          id: p.id,
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          brandId: p.brandId,
          categoryId: p.categoryId,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          rating: p.rating,
          reviewCount: p.reviewCount,
          soldCount: p.soldCount,
          isFeatured: p.isFeatured,
          status: p.status,
          badges: p.badges,
          image: p.image,
          gallery: p.gallery,
          shortDescription: p.shortDescription,
          description: p.description,
          ecosystems: p.ecosystems,
          useCases: p.useCases,
          compatibilityNotes: p.compatibilityNotes,
          batteryHours: p.batteryHours,
          connectivity: p.connectivity,
          waterResistance: p.waterResistance,
          sensors: p.sensors,
          anc: p.anc,
          weightGrams: p.weightGrams,
          warrantyMonths: p.warrantyMonths,
          bundleProductIds: p.bundleProductIds,
        },
      });
    }

    console.log("Seeding customers...");
    for (const c of customers) {
      await prisma.customer.create({
        data: {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          segment: c.segment,
          address: c.address,
          lifetimeSpend: c.lifetimeSpend,
          wishlistProductIds: c.wishlistProductIds,
        },
      });
    }

    console.log("Seeding coupons...");
    for (const c of coupons) {
      await prisma.coupon.create({
        data: {
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          usageCount: c.usageCount,
          usageLimit: c.usageLimit,
          active: c.active,
          startsAt: new Date(c.startsAt),
          endsAt: new Date(c.endsAt),
        },
      });
    }

    console.log("Seeding orders & order items...");
    for (const o of orders) {
      await prisma.order.create({
        data: {
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          shippingAddress: o.shippingAddress,
          note: o.note,
          createdAt: new Date(o.createdAt),
          subtotal: o.subtotal,
          discount: o.discount,
          shippingFee: o.shippingFee,
          total: o.total,
          items: {
            create: o.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      });
    }

    console.log("Seeding reviews...");
    for (const r of reviews) {
      await prisma.review.create({
        data: {
          id: r.id,
          productId: r.productId,
          customerId: r.customerId,
          rating: r.rating,
          content: r.content,
          status: r.status,
          createdAt: new Date(r.createdAt),
        },
      });
    }

    console.log("Seeding articles & hero banners...");
    for (const a of articles) {
      await prisma.article.create({
        data: {
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          category: a.category,
          published: a.published,
        },
      });
    }

    for (const h of heroBanners) {
      await prisma.heroBanner.create({
        data: {
          id: h.id,
          title: h.title,
          subtitle: h.subtitle,
          ctaLabel: h.ctaLabel,
          ctaHref: h.ctaHref,
          productId: h.productId,
        },
      });
    }

    console.log("Seeding support tickets...");
    for (const s of supportTickets) {
      await prisma.supportTicket.create({
        data: {
          id: s.id,
          customerId: s.customerId,
          productId: s.productId,
          subject: s.subject,
          status: s.status,
          priority: s.priority,
          assignedTo: s.assignedTo,
          createdAt: new Date(s.createdAt),
        },
      });
    }

    console.log("Seeding inventory movements...");
    for (const im of inventoryMovements) {
      await prisma.inventoryMovement.create({
        data: {
          id: im.id,
          productId: im.productId,
          type: im.type,
          quantity: im.quantity,
          reason: im.reason,
          createdAt: new Date(im.createdAt),
        },
      });
    }

    console.log("Database seeded successfully!");
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```
- [ ] **Step 2: Add prisma configuration to package.json**
  Add key under package.json:
  ```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
  ```
- [ ] **Step 3: Run seeding script**
  Run command:
  ```powershell
  npx prisma db seed
  ```
  Expected: "Database seeded successfully!".

---

### Task 7: Test Database Connection

**Files:**
* Create: [test-connection.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/test-connection.ts)

- [ ] **Step 1: Create test script**
  Create `src/lib/test-connection.ts` with:
  ```typescript
  import { db } from "./db";

  async function test() {
    try {
      const categories = await db.category.findMany();
      console.log("Connection successful! Categories fetched:", categories.length);
      console.log("Categories list:", categories.map(c => c.name));
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      process.exit(0);
    }
  }

  test();
  ```
- [ ] **Step 2: Execute connection test**
  Run:
  ```powershell
  npx tsx src/lib/test-connection.ts
  ```
  Expected: "Connection successful! Categories fetched: 5" and lists categories like Watch, Earbuds, Band, Tablet, Accessory.

---

### Task 8: Integrate Neon DB to Trang Chủ (HomePage)

**Files:**
* Modify: [page.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/app/page.tsx):1-155

- [ ] **Step 1: Update page.tsx to query Prisma instead of importing static files**
  Replace imports and update `HomePage` component to fetch asynchronously:
  ```typescript
  import Image from "next/image";
  import Link from "next/link";
  import { ArrowRight, PackageCheck, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";
  import { CustomerShell } from "@/components/layout/CustomerShell";
  import { ProductGrid } from "@/components/product/ProductGrid";
  import { RhythmFinder } from "@/components/finder/RhythmFinder";
  import { Badge } from "@/components/ui/Badge";
  import { formatCurrency } from "@/lib/utils";
  import { db } from "@/lib/db";
  import type { Product, ProductCategory, Ecosystem, UseCase } from "@/types/domain";

  const categoryCopy: Record<string, string> = {
    watch: "Smartwatches",
    earbuds: "Earbuds",
    band: "Bands",
    tablet: "Tablets",
    accessory: "Smart accessories",
  };

  const trustBlocks = [
    {
      title: "Bao hanh ro rang",
      copy: "12-24 thang tuy dong san pham, thong tin hien ngay tren tung thiet bi.",
      icon: ShieldCheck,
    },
    {
      title: "Tuong thich truoc khi mua",
      copy: "Loc theo iOS, Android, Windows hoac da he sinh thai.",
      icon: Smartphone,
    },
    {
      title: "Doi tra gon",
      copy: "Trang san pham neu ro ton kho, phu kien va ghi chu phu hop.",
      icon: RotateCcw,
    },
    {
      title: "Curated by rhythm",
      copy: "Lua chon theo cach ban lam viec, tap luyen, hoc tap va nghi ngoi.",
      icon: PackageCheck,
    },
  ];

  const guideLinks: Record<string, string> = {
    "article-rhythm-finder": "/san-pham?useCase=everyday",
    "article-battery-care": "/san-pham?sort=battery",
    "article-focus-setup": "/san-pham?useCase=focus",
  };

  export default async function HomePage() {
    // Fetch all required data from Neon DB
    const rawProducts = await db.product.findMany();
    const categories = await db.category.findMany();
    const articles = await db.article.findMany();
    const heroBanners = await db.heroBanner.findMany();

    // Map DB models to domains
    const products: Product[] = rawProducts.map((p) => ({
      ...p,
      categoryId: p.categoryId as ProductCategory,
      ecosystems: p.ecosystems as Ecosystem[],
      useCases: p.useCases as UseCase[],
      badges: p.badges as any[],
      originalPrice: p.originalPrice ?? undefined,
      waterResistance: p.waterResistance ?? undefined,
      anc: p.anc ?? undefined,
      weightGrams: p.weightGrams ?? undefined,
    }));

    const hero = heroBanners[0] || { title: "Pulse Atelier", subtitle: "", ctaLabel: "Catalog", ctaHref: "/san-pham", productId: "" };
    const heroProduct = products.find((product) => product.id === hero.productId) ?? products[0];
    const featuredProducts = products.filter((product) => product.status === "active" && product.isFeatured).slice(0, 4);
    const bundleBase = products.find((product) => product.slug === "aura-watch-pro") ?? products[0];
    const bundleProducts = products.filter((product) => bundleBase.bundleProductIds.includes(product.id));
    const bundleTotal = [bundleBase, ...bundleProducts].reduce((total, product) => total + product.price, 0);
    const guideArticles = articles.filter((article) => article.published).slice(0, 3);
  ```
- [ ] **Step 2: Run dev server**
  Run:
  ```powershell
  npm run dev
  ```
  Expected: Server starts on port 3100.
- [ ] **Step 3: Open site in browser and verify homepage displays all dynamic content from DB**
  Verify products, categories, guide articles and hero banner display exactly like mock data.

---

## Verification Plan

### Automated Tests
- Run `npx prisma validate`
- Run connection script: `npx tsx src/lib/test-connection.ts`

### Manual Verification
- Open `http://localhost:3100` and confirm the homepage is fully interactive and rendering dynamically.
