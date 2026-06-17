# Pulse Atelier Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Pulse Atelier as a standalone frontend-first Next.js app for premium personal smart electronics at `apps/pulse-atelier`.

**Architecture:** Keep Pulse Atelier separate from the existing Tempus storefront. Use typed mock data and small client stores for demo interactivity, with UI pages consuming local data modules through stable helper functions that can later be replaced by API/database calls. Customer pages prioritize premium shopping flows; admin pages prioritize dense operational views.

**Tech Stack:** Next.js 16.2.7, React 19.2.4, TypeScript, Tailwind CSS 4, Zustand, lucide-react, clsx, tailwind-merge, sonner, Vitest, ESLint.

---

## Scope Check

The spec covers one coherent deliverable: a standalone frontend demo app. Customer, account, checkout, and admin screens share the same product/order/customer mock data and visual system, so this should remain one implementation plan.

Do not refactor or convert the existing Tempus app under the root `src/` directory. Only modify root files when adding convenience scripts or workspace-safe ignores for Pulse Atelier.

## File Structure Map

Create:

- `apps/pulse-atelier/package.json` - app-local scripts and dependency declarations.
- `apps/pulse-atelier/next.config.ts` - image config for the standalone app.
- `apps/pulse-atelier/tsconfig.json` - strict TypeScript config with `@/*` path alias.
- `apps/pulse-atelier/postcss.config.mjs` - Tailwind CSS 4 PostCSS setup.
- `apps/pulse-atelier/eslint.config.mjs` - reuse the root ESLint config.
- `apps/pulse-atelier/vitest.config.mts` - pure function test setup.
- `apps/pulse-atelier/src/app/layout.tsx` - root metadata, HTML shell, toast provider.
- `apps/pulse-atelier/src/app/globals.css` - Pulse Atelier visual system and utilities.
- `apps/pulse-atelier/src/app/page.tsx` - customer homepage.
- `apps/pulse-atelier/src/app/san-pham/page.tsx` - catalog page.
- `apps/pulse-atelier/src/app/san-pham/[slug]/page.tsx` - product detail page.
- `apps/pulse-atelier/src/app/so-sanh/page.tsx` - Compare Lab page.
- `apps/pulse-atelier/src/app/gio-hang/page.tsx` - cart page.
- `apps/pulse-atelier/src/app/thanh-toan/page.tsx` - checkout demo page.
- `apps/pulse-atelier/src/app/tai-khoan/page.tsx` - account page.
- `apps/pulse-atelier/src/app/dang-nhap/page.tsx` - demo login page.
- `apps/pulse-atelier/src/app/admin/page.tsx` - admin dashboard.
- `apps/pulse-atelier/src/app/admin/san-pham/page.tsx` - admin products.
- `apps/pulse-atelier/src/app/admin/don-hang/page.tsx` - admin orders.
- `apps/pulse-atelier/src/app/admin/khach-hang/page.tsx` - admin customers.
- `apps/pulse-atelier/src/app/admin/kho/page.tsx` - admin inventory.
- `apps/pulse-atelier/src/app/admin/ma-giam-gia/page.tsx` - admin coupons.
- `apps/pulse-atelier/src/app/admin/danh-gia/page.tsx` - admin reviews.
- `apps/pulse-atelier/src/app/admin/ho-tro/page.tsx` - admin support and warranty.
- `apps/pulse-atelier/src/app/admin/noi-dung/page.tsx` - admin content.
- `apps/pulse-atelier/src/app/admin/cai-dat/page.tsx` - admin settings.
- `apps/pulse-atelier/src/components/layout/*` - customer/admin shells.
- `apps/pulse-atelier/src/components/ui/*` - buttons, badges, cards, empty states, stat cards, forms.
- `apps/pulse-atelier/src/components/product/*` - product card, product specs, filters.
- `apps/pulse-atelier/src/components/finder/*` - Rhythm Finder UI.
- `apps/pulse-atelier/src/components/compare/*` - Compare Lab UI.
- `apps/pulse-atelier/src/components/cart/*` - cart summary and line items.
- `apps/pulse-atelier/src/components/checkout/*` - checkout form and confirmation state.
- `apps/pulse-atelier/src/components/account/*` - account panels.
- `apps/pulse-atelier/src/components/admin/*` - admin tables, panels, forms, status controls.
- `apps/pulse-atelier/src/data/*` - typed mock data.
- `apps/pulse-atelier/src/lib/*` - formatting, catalog filtering, finder, checkout validation, admin helpers.
- `apps/pulse-atelier/src/stores/*` - cart, wishlist, compare, demo session, admin demo stores.
- `apps/pulse-atelier/src/types/domain.ts` - domain model types.
- `apps/pulse-atelier/tests/*.test.ts` - pure function and store tests.

Modify:

- `package.json` - add root scripts for `pulse:dev`, `pulse:build`, `pulse:lint`, and `pulse:test`.

## Task 1: Read Next Docs And Scaffold The Standalone App

**Files:**

- Create: `apps/pulse-atelier/package.json`
- Create: `apps/pulse-atelier/next.config.ts`
- Create: `apps/pulse-atelier/tsconfig.json`
- Create: `apps/pulse-atelier/postcss.config.mjs`
- Create: `apps/pulse-atelier/eslint.config.mjs`
- Create: `apps/pulse-atelier/vitest.config.mts`
- Create: `apps/pulse-atelier/src/app/layout.tsx`
- Create: `apps/pulse-atelier/src/app/globals.css`
- Create: `apps/pulse-atelier/src/app/page.tsx`
- Create: `apps/pulse-atelier/src/lib/utils.ts`
- Modify: `package.json`

- [ ] **Step 1: Read local Next.js 16 docs before coding**

Run:

```powershell
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\02-project-structure.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\03-layouts-and-pages.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\05-server-and-client-components.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\11-css.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\12-images.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\13-fonts.md'
Get-Content -LiteralPath 'node_modules\next\dist\docs\01-app\01-getting-started\14-metadata-and-og-images.md'
```

Expected: each command prints the installed Next.js documentation. Record any convention changes in worker notes before editing files.

- [ ] **Step 2: Create the app package file**

Create `apps/pulse-atelier/package.json` with:

```json
{
  "name": "pulse-atelier",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3100",
    "build": "next build",
    "start": "next start --port 3100",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.17.0",
    "next": "16.2.7",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.7",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.9"
  }
}
```

- [ ] **Step 3: Add root convenience scripts**

Modify the root `package.json` `scripts` object to include these keys while preserving existing scripts:

```json
{
  "pulse:dev": "npm --prefix apps/pulse-atelier run dev",
  "pulse:build": "npm --prefix apps/pulse-atelier run build",
  "pulse:lint": "npm --prefix apps/pulse-atelier run lint",
  "pulse:test": "npm --prefix apps/pulse-atelier run test"
}
```

Expected: the root app still has its existing `dev`, `build`, `start`, `lint`, and `test` scripts.

- [ ] **Step 4: Add app configs**

Create `apps/pulse-atelier/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
```

Create `apps/pulse-atelier/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

Create `apps/pulse-atelier/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Create `apps/pulse-atelier/eslint.config.mjs`:

```js
import rootConfig from "../../eslint.config.mjs";

export default rootConfig;
```

Create `apps/pulse-atelier/vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 5: Add utility helpers**

Create `apps/pulse-atelier/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

- [ ] **Step 6: Add global styling and root shell**

Create `apps/pulse-atelier/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-obsidian: #101418;
  --color-graphite: #151B21;
  --color-panel: #1B232B;
  --color-panel-soft: #202A33;
  --color-pulse: #88F0D0;
  --color-signal: #6D7CFF;
  --color-frost: #EEF6F7;
  --color-steel: #AAB8BF;
  --color-line: #2C3A44;
  --color-warning: #F8C66A;
  --color-danger: #FF7A8A;
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 30% 0%, rgba(136, 240, 208, 0.14), transparent 30%),
    radial-gradient(circle at 90% 8%, rgba(109, 124, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #101418 0%, #121820 48%, #0F1318 100%);
  color: var(--color-frost);
  font-family: var(--font-sans);
  min-height: 100vh;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--color-pulse);
  outline-offset: 3px;
}

.shell {
  width: min(100% - 32px, 1440px);
  margin-inline: auto;
}

.surface {
  background: rgba(27, 35, 43, 0.74);
  border: 1px solid rgba(170, 184, 191, 0.14);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
}

.text-balance {
  text-wrap: balance;
}

@media (max-width: 760px) {
  .shell {
    width: min(100% - 24px, 1440px);
  }
}
```

Create `apps/pulse-atelier/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse Atelier - Premium smart devices",
  description:
    "Pulse Atelier curates premium smartwatches, earbuds, tablets, and personal smart accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

Create `apps/pulse-atelier/src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="shell py-16">
      <p className="text-sm uppercase tracking-[0.28em] text-pulse">
        Pulse Atelier
      </p>
      <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight text-frost text-balance">
        Wearable intelligence, curated for your rhythm.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-steel">
        A standalone frontend demo for premium smartwatches, earbuds,
        tablets, and personal smart accessories.
      </p>
    </main>
  );
}
```

- [ ] **Step 7: Run the first scaffold checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
```

Expected:

- `pulse:lint` exits 0.
- `pulse:build` exits 0 and builds only `apps/pulse-atelier`.

- [ ] **Step 8: Commit scaffold**

Run:

```powershell
git add package.json apps/pulse-atelier
git commit -m "Scaffold Pulse Atelier frontend app"
```

Expected: commit succeeds. If `git` is not available in PATH, write this in worker notes and continue without pretending the commit happened.

## Task 2: Add Domain Types, Mock Data, And Query Helpers

**Files:**

- Create: `apps/pulse-atelier/src/types/domain.ts`
- Create: `apps/pulse-atelier/src/data/brands.ts`
- Create: `apps/pulse-atelier/src/data/categories.ts`
- Create: `apps/pulse-atelier/src/data/products.ts`
- Create: `apps/pulse-atelier/src/data/customers.ts`
- Create: `apps/pulse-atelier/src/data/orders.ts`
- Create: `apps/pulse-atelier/src/data/admin.ts`
- Create: `apps/pulse-atelier/src/data/content.ts`
- Create: `apps/pulse-atelier/src/lib/catalog.ts`
- Create: `apps/pulse-atelier/src/lib/finder.ts`
- Create: `apps/pulse-atelier/tests/catalog.test.ts`
- Create: `apps/pulse-atelier/tests/finder.test.ts`

- [ ] **Step 1: Write failing catalog and finder tests**

Create `apps/pulse-atelier/tests/catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { filterProducts, getProductBySlug, sortProducts } from "@/lib/catalog";
import { products } from "@/data/products";

describe("catalog helpers", () => {
  it("finds a product by slug", () => {
    expect(getProductBySlug("aura-watch-pro")).toMatchObject({
      name: "Aura Watch Pro",
    });
  });

  it("filters products by ecosystem and use case", () => {
    const result = filterProducts(products, {
      ecosystems: ["ios"],
      useCases: ["fitness"],
    });

    expect(result.map((product) => product.slug)).toContain("aura-watch-pro");
    expect(result.every((product) => product.ecosystems.includes("ios"))).toBe(
      true,
    );
  });

  it("sorts products by battery life descending", () => {
    const result = sortProducts(products, "battery");
    expect(result[0].batteryHours).toBeGreaterThanOrEqual(
      result[result.length - 1].batteryHours,
    );
  });
});
```

Create `apps/pulse-atelier/tests/finder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { recommendProductsForRhythm } from "@/lib/finder";

describe("Rhythm Finder", () => {
  it("recommends fitness devices with a reason", () => {
    const result = recommendProductsForRhythm("fitness");

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].reason.length).toBeGreaterThan(12);
    expect(result.some((item) => item.product.useCases.includes("fitness"))).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm.cmd run pulse:test
```

Expected: tests fail because `@/lib/catalog`, `@/lib/finder`, and mock data files do not exist yet.

- [ ] **Step 3: Add domain types**

Create `apps/pulse-atelier/src/types/domain.ts`:

```ts
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
  items: OrderItem[];
  shippingAddress: string;
  note: string;
  createdAt: string;
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
```

- [ ] **Step 4: Add mock brands and categories**

Create `apps/pulse-atelier/src/data/brands.ts` with at least these records: Aura, Sonic, Garmin, Samsung, Apple, Lenovo, Sony, Fitbit. Export `brands: Brand[]`.

Create `apps/pulse-atelier/src/data/categories.ts` with exactly these category ids and Vietnamese names:

```ts
import type { Category } from "@/types/domain";

export const categories: Category[] = [
  {
    id: "watch",
    name: "Dong ho thong minh",
    slug: "dong-ho-thong-minh",
    description: "Thiet bi deo cao cap cho suc khoe, lich trinh va tap luyen.",
  },
  {
    id: "earbuds",
    name: "Tai nghe thong minh",
    slug: "tai-nghe-thong-minh",
    description: "Am thanh khong day, chong on va tro ly hinh trinh.",
  },
  {
    id: "band",
    name: "Vong suc khoe",
    slug: "vong-suc-khoe",
    description: "Theo doi suc khoe nhe, pin lau va deo thoai mai.",
  },
  {
    id: "tablet",
    name: "Tablet",
    slug: "tablet",
    description: "Man hinh lam viec, hoc tap va giai tri di dong.",
  },
  {
    id: "accessory",
    name: "Phu kien thong minh",
    slug: "phu-kien-thong-minh",
    description: "De sac, bao ve va ket noi he sinh thai ca nhan.",
  },
];
```

- [ ] **Step 5: Add product mock data**

Create `apps/pulse-atelier/src/data/products.ts`. It must export `products: Product[]` with at least these products and slugs:

- `aura-watch-pro`
- `sonic-air-max`
- `garmin-vital-x`
- `samsung-galaxy-tab-aura`
- `apple-watch-series-atelier`
- `sony-focus-buds`
- `fitbit-sense-lite`
- `lenovo-tab-studio`
- `aura-ring-mini`
- `sonic-sleep-buds`
- `pulse-charge-duo`
- `atelier-magnetic-band`

Each product object must include every required `Product` field from `src/types/domain.ts`. Use remote images from `https://images.unsplash.com/` only, so the Next image config in Task 1 covers them.

The first product must match this object so tests pass:

```ts
{
  id: "prod-aura-watch-pro",
  sku: "PA-WATCH-PRO-01",
  name: "Aura Watch Pro",
  slug: "aura-watch-pro",
  brandId: "brand-aura",
  categoryId: "watch",
  price: 12990000,
  originalPrice: 14990000,
  stock: 18,
  lowStockThreshold: 6,
  rating: 4.8,
  reviewCount: 128,
  soldCount: 540,
  isFeatured: true,
  status: "active",
  badges: ["Best fit", "Save"],
  image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1400&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop"
  ],
  shortDescription: "Smartwatch titanium voi man hinh sang, pin 36 gio va cam bien suc khoe nang cao.",
  description: "Aura Watch Pro duoc chon cho nguoi can mot thiet bi deo cao cap de theo doi suc khoe, lich tap va thong bao hang ngay.",
  ecosystems: ["ios", "android"],
  useCases: ["fitness", "work", "everyday"],
  compatibilityNotes: ["Ho tro iOS 17 tro len", "Ho tro Android 12 tro len"],
  batteryHours: 36,
  connectivity: ["Bluetooth 5.3", "Wi-Fi", "NFC"],
  waterResistance: "5ATM",
  sensors: ["Heart rate", "SpO2", "ECG", "Sleep"],
  anc: false,
  weightGrams: 42,
  warrantyMonths: 24,
  bundleProductIds: ["prod-pulse-charge-duo", "prod-atelier-magnetic-band"]
}
```

- [ ] **Step 6: Add supporting mock data**

Create:

- `apps/pulse-atelier/src/data/customers.ts` exporting `customers`; the first customer id must be `cust-minh-anh` so the demo session store can load a stable customer profile.
- `apps/pulse-atelier/src/data/orders.ts` exporting `orders`; include at least 8 orders referencing real customer and product ids.
- `apps/pulse-atelier/src/data/admin.ts` exporting `inventoryMovements`, `reviews`, `coupons`, and `supportTickets`; include at least 8 inventory movements, 8 reviews, 5 coupons, and 6 support tickets.
- `apps/pulse-atelier/src/data/content.ts` exporting `articles` and `heroBanners`; include at least 3 articles and 2 hero banners.

Every id referenced by an order, review, support ticket, or banner must exist in the relevant data file.

- [ ] **Step 7: Implement catalog helpers**

Create `apps/pulse-atelier/src/lib/catalog.ts`:

```ts
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
```

- [ ] **Step 8: Implement Rhythm Finder helper**

Create `apps/pulse-atelier/src/lib/finder.ts`:

```ts
import { products } from "@/data/products";
import type { Product, UseCase } from "@/types/domain";

export interface FinderRecommendation {
  product: Product;
  reason: string;
}

const rhythmCopy: Record<UseCase, string> = {
  work: "keeps notifications, calendar, and battery life balanced for long workdays",
  fitness: "matches fitness tracking, water resistance, and health sensor needs",
  travel: "prioritizes battery life, comfort, and cross-platform reliability on the move",
  study: "supports reading, notes, calls, and lightweight focus sessions",
  focus: "reduces distractions with audio control, comfort, and long sessions",
  gaming: "favors low-latency audio, display quality, and entertainment features",
  everyday: "balances comfort, price, ecosystem fit, and daily reliability",
  entertainment: "leans into screen, audio, and relaxed daily use",
};

export function recommendProductsForRhythm(rhythm: UseCase): FinderRecommendation[] {
  return products
    .filter((product) => product.status === "active" && product.useCases.includes(rhythm))
    .sort((a, b) => b.rating - a.rating || b.soldCount - a.soldCount)
    .slice(0, 4)
    .map((product) => ({
      product,
      reason: `${product.name} ${rhythmCopy[rhythm]}.`,
    }));
}
```

- [ ] **Step 9: Run data tests**

Run:

```powershell
npm.cmd run pulse:test
```

Expected: catalog and finder tests pass.

- [ ] **Step 10: Commit data layer**

Run:

```powershell
git add apps/pulse-atelier/src/types apps/pulse-atelier/src/data apps/pulse-atelier/src/lib apps/pulse-atelier/tests
git commit -m "Add Pulse Atelier mock data model"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 3: Add Client Stores And Demo State

**Files:**

- Create: `apps/pulse-atelier/src/stores/cart-store.ts`
- Create: `apps/pulse-atelier/src/stores/wishlist-store.ts`
- Create: `apps/pulse-atelier/src/stores/compare-store.ts`
- Create: `apps/pulse-atelier/src/stores/demo-session-store.ts`
- Create: `apps/pulse-atelier/src/stores/admin-demo-store.ts`
- Create: `apps/pulse-atelier/src/lib/checkout.ts`
- Create: `apps/pulse-atelier/tests/checkout.test.ts`
- Create: `apps/pulse-atelier/tests/stores.test.ts`

- [ ] **Step 1: Write failing store and checkout tests**

Create `apps/pulse-atelier/tests/checkout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateCartTotals, validateCheckout } from "@/lib/checkout";

describe("checkout helpers", () => {
  it("calculates subtotal, discount, shipping, and total", () => {
    const result = calculateCartTotals([
      { productId: "prod-aura-watch-pro", quantity: 1, unitPrice: 12990000 },
      { productId: "prod-sonic-air-max", quantity: 2, unitPrice: 5990000 },
    ], "PULSE10");

    expect(result.discount).toBeGreaterThan(0);
    expect(result.total).toBe(result.subtotal - result.discount + result.shippingFee);
  });

  it("returns field errors for invalid checkout data", () => {
    const result = validateCheckout({
      name: "",
      email: "not-an-email",
      phone: "1",
      address: "",
      paymentMethod: "",
      note: "",
      couponCode: "",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.email).toBeDefined();
  });
});
```

Create `apps/pulse-atelier/tests/stores.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAddToCompare } from "@/stores/compare-store";

describe("compare store helpers", () => {
  it("allows up to four compare products", () => {
    expect(canAddToCompare(["a", "b", "c"], "d")).toBe(true);
    expect(canAddToCompare(["a", "b", "c", "d"], "e")).toBe(false);
    expect(canAddToCompare(["a", "b"], "b")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm.cmd run pulse:test
```

Expected: tests fail because checkout helpers and stores do not exist.

- [ ] **Step 3: Implement checkout helpers**

Create `apps/pulse-atelier/src/lib/checkout.ts`:

```ts
import type { OrderItem } from "@/types/domain";

export interface CheckoutInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  note: string;
  couponCode: string;
}

export interface CheckoutValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof CheckoutInput, string>>;
}

export function calculateCartTotals(items: OrderItem[], couponCode = "") {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = subtotal >= 20_000_000 || subtotal === 0 ? 0 : 45000;
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const discount = normalizedCoupon === "PULSE10" ? Math.round(subtotal * 0.1) : 0;

  return {
    subtotal,
    discount,
    shippingFee,
    total: Math.max(0, subtotal - discount + shippingFee),
  };
}

export function validateCheckout(input: CheckoutInput): CheckoutValidationResult {
  const errors: CheckoutValidationResult["errors"] = {};

  if (input.name.trim().length < 2) errors.name = "Nhap ho ten it nhat 2 ky tu.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "Email khong hop le.";
  if (input.phone.trim().length < 8) errors.phone = "So dien thoai qua ngan.";
  if (input.address.trim().length < 8) errors.address = "Nhap dia chi giao hang ro rang hon.";
  if (!["cod", "bank", "card"].includes(input.paymentMethod)) errors.paymentMethod = "Chon phuong thuc thanh toan.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
```

- [ ] **Step 4: Implement stores**

Create `apps/pulse-atelier/src/stores/compare-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export function canAddToCompare(productIds: string[], productId: string) {
  return !productIds.includes(productId) && productIds.length < 4;
}

interface CompareState {
  productIds: string[];
  add: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (productId) => {
        const current = get().productIds;
        if (!canAddToCompare(current, productId)) return false;
        set({ productIds: [...current, productId] });
        return true;
      },
      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clear: () => set({ productIds: [] }),
    }),
    { name: "pulse-compare" },
  ),
);
```

Create `apps/pulse-atelier/src/stores/cart-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: Math.min(9, item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: Math.max(1, quantity) }] };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.max(1, Math.min(9, quantity)) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "pulse-cart" },
  ),
);
```

Create `apps/pulse-atelier/src/stores/wishlist-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    { name: "pulse-wishlist" },
  ),
);
```

Create `apps/pulse-atelier/src/stores/demo-session-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DemoRole = "guest" | "customer" | "admin";

interface DemoSessionState {
  role: DemoRole;
  customerId: string | null;
  loginAsCustomer: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

export const useDemoSessionStore = create<DemoSessionState>()(
  persist(
    (set) => ({
      role: "guest",
      customerId: null,
      loginAsCustomer: () => set({ role: "customer", customerId: "cust-minh-anh" }),
      loginAsAdmin: () => set({ role: "admin", customerId: null }),
      logout: () => set({ role: "guest", customerId: null }),
    }),
    { name: "pulse-demo-session" },
  ),
);
```

Create `apps/pulse-atelier/src/stores/admin-demo-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { coupons as initialCoupons, reviews as initialReviews, supportTickets as initialSupportTickets } from "@/data/admin";
import { orders as initialOrders } from "@/data/orders";
import { products as initialProducts } from "@/data/products";
import type {
  Coupon,
  Order,
  OrderStatus,
  Product,
  ProductStatus,
  Review,
  ReviewStatus,
  SupportTicket,
  TicketStatus,
} from "@/types/domain";

interface AdminDemoState {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  tickets: SupportTicket[];
  coupons: Coupon[];
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  updateProductStock: (productId: string, stock: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  toggleCoupon: (couponId: string) => void;
}

export const useAdminDemoStore = create<AdminDemoState>()((set) => ({
  products: initialProducts,
  orders: initialOrders,
  reviews: initialReviews,
  tickets: initialSupportTickets,
  coupons: initialCoupons,
  updateProductStatus: (productId, status) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId ? { ...product, status } : product,
      ),
    })),
  updateProductStock: (productId, stock) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId ? { ...product, stock: Math.max(0, stock) } : product,
      ),
    })),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    })),
  updateReviewStatus: (reviewId, status) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === reviewId ? { ...review, status } : review,
      ),
    })),
  updateTicketStatus: (ticketId, status) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket,
      ),
    })),
  toggleCoupon: (couponId) =>
    set((state) => ({
      coupons: state.coupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon,
      ),
    })),
}));
```

- [ ] **Step 5: Run store tests**

Run:

```powershell
npm.cmd run pulse:test
```

Expected: tests pass.

- [ ] **Step 6: Commit stores**

Run:

```powershell
git add apps/pulse-atelier/src/stores apps/pulse-atelier/src/lib/checkout.ts apps/pulse-atelier/tests
git commit -m "Add Pulse Atelier demo stores"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 4: Build Shared Layout, UI, And Product Components

**Files:**

- Create: `apps/pulse-atelier/src/components/layout/CustomerShell.tsx`
- Create: `apps/pulse-atelier/src/components/layout/AdminShell.tsx`
- Create: `apps/pulse-atelier/src/components/layout/Header.tsx`
- Create: `apps/pulse-atelier/src/components/layout/Footer.tsx`
- Create: `apps/pulse-atelier/src/components/ui/Button.tsx`
- Create: `apps/pulse-atelier/src/components/ui/Badge.tsx`
- Create: `apps/pulse-atelier/src/components/ui/EmptyState.tsx`
- Create: `apps/pulse-atelier/src/components/ui/MetricCard.tsx`
- Create: `apps/pulse-atelier/src/components/product/ProductCard.tsx`
- Create: `apps/pulse-atelier/src/components/product/ProductSpecs.tsx`
- Modify: `apps/pulse-atelier/src/app/page.tsx`

- [ ] **Step 1: Create UI primitives**

Create `Button`, `Badge`, `EmptyState`, and `MetricCard` components with:

- Typed props.
- `cn` utility for class names.
- 8px or smaller border radius.
- Visible focus states.
- No nested card styling.

`Button.tsx` must export a `Button` component with variants `primary`, `secondary`, `ghost`, and `danger`.

- [ ] **Step 2: Create customer and admin shells**

Create `CustomerShell.tsx` that renders `Header`, main content, and `Footer`.

Create `AdminShell.tsx` that renders a fixed-width sidebar on desktop, a compact top navigation on mobile, and main content. Include links to all admin routes:

- `/admin`
- `/admin/san-pham`
- `/admin/don-hang`
- `/admin/khach-hang`
- `/admin/kho`
- `/admin/ma-giam-gia`
- `/admin/danh-gia`
- `/admin/ho-tro`
- `/admin/noi-dung`
- `/admin/cai-dat`

- [ ] **Step 3: Create product display components**

Create `ProductCard.tsx` with:

- Stable image area using CSS `aspect-ratio: 4 / 5`.
- Brand/category text.
- Price and original price.
- Rating.
- Stock state.
- Add-to-cart, wishlist, and compare icon buttons using lucide-react.

Create `ProductSpecs.tsx` with:

- Battery.
- Ecosystems.
- Connectivity.
- Water resistance.
- Sensors.
- ANC when present.
- Warranty.

- [ ] **Step 4: Replace scaffold homepage with shell usage**

Modify `apps/pulse-atelier/src/app/page.tsx` to wrap the page in `CustomerShell`, still showing the simple hero until Task 5 adds full content.

- [ ] **Step 5: Run layout checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit shared UI**

Run:

```powershell
git add apps/pulse-atelier/src/components apps/pulse-atelier/src/app/page.tsx
git commit -m "Build Pulse Atelier shared UI system"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 5: Implement Customer Shopping Pages

**Files:**

- Modify: `apps/pulse-atelier/src/app/page.tsx`
- Create: `apps/pulse-atelier/src/app/san-pham/page.tsx`
- Create: `apps/pulse-atelier/src/app/san-pham/[slug]/page.tsx`
- Create: `apps/pulse-atelier/src/app/so-sanh/page.tsx`
- Create: `apps/pulse-atelier/src/components/finder/RhythmFinder.tsx`
- Create: `apps/pulse-atelier/src/components/compare/CompareTable.tsx`
- Create: `apps/pulse-atelier/src/components/product/CatalogFilters.tsx`
- Create: `apps/pulse-atelier/src/components/product/ProductGrid.tsx`

- [ ] **Step 1: Implement the full homepage**

The homepage must include these sections in order:

1. Product-led hero with CTA links to `/san-pham` and Rhythm Finder.
2. Category rail for smartwatches, earbuds, bands, tablets, and accessories.
3. Rhythm Finder component.
4. Featured product grid.
5. Curated bundle section.
6. Trust blocks for warranty, compatibility, returns, and curation.
7. Buying guide article teasers.

- [ ] **Step 2: Implement catalog page**

Create `/san-pham` with:

- Query param support for `q`, `category`, `ecosystem`, `useCase`, and `sort`.
- Filters rendered as compact controls.
- Product grid/list responsive layout.
- Empty state when no products match.

Use `filterProducts` and `sortProducts` from `src/lib/catalog.ts`.

- [ ] **Step 3: Implement product detail page**

Create `/san-pham/[slug]` with:

- `getProductBySlug`.
- Not-found UI for invalid product slugs.
- Product image gallery area.
- Product purchase panel.
- Compatibility notes.
- Product specs.
- Review summary.
- Related products.
- Bundle suggestions.

- [ ] **Step 4: Implement Rhythm Finder interactions**

Create `RhythmFinder.tsx` as a Client Component:

- Let the user select one rhythm.
- Call `recommendProductsForRhythm`.
- Render up to 4 recommendations with reasons.
- Provide add-to-cart and compare actions.

- [ ] **Step 5: Implement Compare Lab**

Create `/so-sanh` and `CompareTable.tsx`:

- Show empty state when fewer than 2 products are selected.
- Show comparison table when 2 to 4 products are selected.
- Include rows for price, battery, ecosystem, connectivity, sensors, ANC, weight, warranty, and use cases.
- Allow removing products from comparison.

- [ ] **Step 6: Run customer checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit customer shopping pages**

Run:

```powershell
git add apps/pulse-atelier/src/app apps/pulse-atelier/src/components apps/pulse-atelier/src/lib
git commit -m "Implement Pulse Atelier customer shopping flows"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 6: Implement Cart, Checkout, Account, And Demo Login

**Files:**

- Create: `apps/pulse-atelier/src/app/gio-hang/page.tsx`
- Create: `apps/pulse-atelier/src/app/thanh-toan/page.tsx`
- Create: `apps/pulse-atelier/src/app/tai-khoan/page.tsx`
- Create: `apps/pulse-atelier/src/app/dang-nhap/page.tsx`
- Create: `apps/pulse-atelier/src/components/cart/CartLineItem.tsx`
- Create: `apps/pulse-atelier/src/components/cart/CartSummary.tsx`
- Create: `apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx`
- Create: `apps/pulse-atelier/src/components/account/AccountOverview.tsx`
- Create: `apps/pulse-atelier/src/components/account/OrderHistory.tsx`
- Create: `apps/pulse-atelier/src/components/account/SupportRequests.tsx`

- [ ] **Step 1: Implement cart page**

Create `/gio-hang` with:

- Empty cart state.
- Cart line items from `useCartStore`.
- Quantity controls with stable dimensions.
- Coupon field.
- Suggested bundles.
- Order summary using `calculateCartTotals`.
- CTA to `/thanh-toan`.

- [ ] **Step 2: Implement checkout demo**

Create `/thanh-toan` with:

- Checkout form.
- Inline validation using `validateCheckout`.
- Payment method choices: COD demo, bank transfer demo, card demo.
- Confirmation state after valid submit.
- Do not clear cart until confirmation is visible.

- [ ] **Step 3: Implement demo login**

Create `/dang-nhap` with:

- Demo customer button.
- Demo admin button.
- Logout button if logged in.
- No real credential fields.
- Clear explanation that this is a frontend demo state.

- [ ] **Step 4: Implement account page**

Create `/tai-khoan` with:

- Unauthorized demo state when role is `guest`.
- Profile overview for the demo customer.
- Saved addresses.
- Order history.
- Wishlist.
- Recently compared products.
- Owned devices from completed orders.
- Support/warranty tickets.

- [ ] **Step 5: Run transactional flow checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit cart, checkout, and account**

Run:

```powershell
git add apps/pulse-atelier/src/app/gio-hang apps/pulse-atelier/src/app/thanh-toan apps/pulse-atelier/src/app/tai-khoan apps/pulse-atelier/src/app/dang-nhap apps/pulse-atelier/src/components/cart apps/pulse-atelier/src/components/checkout apps/pulse-atelier/src/components/account
git commit -m "Implement Pulse Atelier cart checkout and account demo"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 7: Implement Full Admin Demo

**Files:**

- Create: `apps/pulse-atelier/src/app/admin/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/san-pham/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/don-hang/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/khach-hang/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/kho/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/ma-giam-gia/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/danh-gia/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/ho-tro/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/noi-dung/page.tsx`
- Create: `apps/pulse-atelier/src/app/admin/cai-dat/page.tsx`
- Create: `apps/pulse-atelier/src/components/admin/AdminDataTable.tsx`
- Create: `apps/pulse-atelier/src/components/admin/AdminStatusPill.tsx`
- Create: `apps/pulse-atelier/src/components/admin/AdminActionPanel.tsx`
- Create: `apps/pulse-atelier/src/lib/admin.ts`

- [ ] **Step 1: Add admin helper functions**

Create `apps/pulse-atelier/src/lib/admin.ts` with functions that derive dashboard metrics from mock data:

- `getRevenueTotal`
- `getOrderCountByStatus`
- `getLowStockProducts`
- `getTopProducts`
- `getCustomerLifetimeStats`

Each function must be pure and use typed inputs.

- [ ] **Step 2: Build admin shared components**

Create:

- `AdminDataTable` for dense tables with header rows, empty state, and action column support.
- `AdminStatusPill` for order, payment, review, ticket, and product statuses.
- `AdminActionPanel` for demo forms and status controls.

- [ ] **Step 3: Implement admin dashboard**

Create `/admin` with:

- Revenue metric.
- Orders metric.
- Conversion metric.
- Returning customers metric.
- Low-stock panel.
- Top products panel.
- Recent orders table.
- Support queue table.

- [ ] **Step 4: Implement admin products**

Create `/admin/san-pham` with:

- Search and category filters.
- Product table.
- Stock, price, rating, status, and badges.
- Demo edit panel for product status, stock, and badges.

- [ ] **Step 5: Implement admin orders and customers**

Create:

- `/admin/don-hang` with status filters, order table, detail panel, and demo status update actions.
- `/admin/khach-hang` with customer table, segment, lifetime spend, order count, wishlist count, and support count.

- [ ] **Step 6: Implement remaining admin sections**

Create:

- `/admin/kho` with stock table and inventory movement feed.
- `/admin/ma-giam-gia` with coupon table and demo active toggle.
- `/admin/danh-gia` with moderation table and approve/hide actions.
- `/admin/ho-tro` with support and warranty tickets.
- `/admin/noi-dung` with hero banners and buying guides.
- `/admin/cai-dat` with store profile, shipping fee, return policy, warranty copy, and payment method labels.

- [ ] **Step 7: Run admin checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit admin demo**

Run:

```powershell
git add apps/pulse-atelier/src/app/admin apps/pulse-atelier/src/components/admin apps/pulse-atelier/src/lib/admin.ts
git commit -m "Implement Pulse Atelier admin demo"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Task 8: Final Verification And Browser QA

**Files:**

- Modify only files needed to fix issues found during verification.

- [ ] **Step 1: Run full command verification**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all commands exit 0.

- [ ] **Step 2: Start local dev server**

Run:

```powershell
npm.cmd run pulse:dev
```

Expected: Pulse Atelier starts at `http://localhost:3100`.

- [ ] **Step 3: Browser-check customer flows**

Open `http://localhost:3100` and verify:

- Home renders product-led Pulse Atelier hero.
- `/san-pham` filters and sorting work.
- `/san-pham/aura-watch-pro` renders product detail.
- Rhythm Finder returns recommendations.
- Compare Lab shows empty state with one product and table with two products.
- Cart quantity changes update totals.
- Checkout shows validation errors and confirmation state.
- Account shows unauthorized state as guest and account panels as demo customer.

- [ ] **Step 4: Browser-check admin flows**

Open `http://localhost:3100/admin` and verify:

- Dashboard metrics render.
- Products table renders and demo edit actions visibly update state.
- Orders table renders and status actions visibly update state.
- Customers table renders.
- Inventory, coupons, reviews, support, content, and settings routes render.
- Tables fit on mobile through horizontal scroll or responsive stacking.

- [ ] **Step 5: Visual and accessibility pass**

Check:

- Text does not overlap buttons, cards, filters, forms, or tables at mobile widths.
- Product cards keep stable image dimensions.
- Focus ring is visible on buttons, links, inputs, and select controls.
- Reduced motion is respected for any decorative animation.
- The palette stays within Pulse Atelier tokens and does not become a single-hue theme.

Run:

```powershell
rg "#|rgb|hsl|oklch|var\(--" apps/pulse-atelier/src
```

Expected: colors are token-based or match the approved Pulse Atelier palette.

- [ ] **Step 6: Final commit**

Run:

```powershell
git add apps/pulse-atelier package.json
git commit -m "Complete Pulse Atelier frontend demo"
```

Expected: commit succeeds, or skip with a worker note if `git` is unavailable.

## Handoff Criteria

The implementation is complete when:

- `apps/pulse-atelier` exists and runs independently.
- `npm.cmd run pulse:lint` passes.
- `npm.cmd run pulse:build` passes.
- `npm.cmd run pulse:test` passes.
- Existing Tempus source under root `src/` is not converted or removed.
- Customer, account, checkout, compare, and admin routes are navigable.
- Cart, wishlist, compare, checkout validation, and admin demo actions work in the browser.
- Pulse Atelier visual system is applied consistently.
- Desktop and mobile browser checks pass.
