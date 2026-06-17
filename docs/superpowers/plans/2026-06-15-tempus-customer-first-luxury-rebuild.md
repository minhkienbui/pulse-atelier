# Tempus Customer-First Luxury Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Tempus VN into a production-ready luxury watch ecommerce experience focused on customer shopping, account, checkout, VNPAY payment, and premium interface quality while keeping the existing Next.js/Prisma foundation.
**Architecture:** Keep Next.js App Router as the presentation and routing layer, move customer-facing reads and writes into server-side data modules and Server Actions, use Prisma as the single persistence layer, keep client state only for short-lived cart and wishlist interactions, and reserve a separate Phase 2 plan for full admin rebuild.
**Tech Stack:** Next 16.2.7, React 19.2.4, TypeScript, Tailwind CSS 4, NextAuth v5 beta, Prisma 7, Neon Postgres, Zustand, Framer Motion, lucide-react, bcryptjs, zod, VNPAY.
---

## Scope

This plan covers Phase 0 and Phase 1 only:

- Phase 0: stabilize runtime, Prisma, auth, security, and route conventions.
- Phase 1: replace mock customer data with real data paths, implement customer checkout with VNPAY, and apply the luxury visual system to customer-facing pages.

Admin CRUD, staff workflows, analytics, inventory receiving, and order-fulfillment dashboards remain Phase 2 and must be planned separately after this plan lands.

## Current Project Map

Relevant existing files and directories:

- `src/app/(shop)/page.tsx` - homepage.
- `src/app/(shop)/dong-ho/page.tsx` - catalog page.
- `src/app/(shop)/dong-ho/[slug]/page.tsx` - product detail page.
- `src/app/(shop)/gio-hang/page.tsx` - cart page.
- `src/app/(shop)/thanh-toan/page.tsx` - checkout page.
- `src/app/(shop)/tai-khoan/page.tsx` - account page.
- `src/app/(shop)/wishlist/page.tsx` - wishlist page.
- `src/app/(shop)/auth/dang-nhap/page.tsx` - login page.
- `src/app/(shop)/auth/dang-ky/page.tsx` - registration page.
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth route.
- `src/app/api/auth/register/route.ts` - registration handler.
- `src/auth.config.ts` - NextAuth config.
- `src/middleware.ts` - deprecated Next route protection convention.
- `src/lib/prisma.ts` - Prisma client.
- `src/lib/mock-data.ts` - customer mock catalog data.
- `src/lib/store.ts` - Zustand cart and wishlist state.
- `src/components/layout/*` - shared navigation and footer.
- `src/components/product/*` - product UI components.
- `src/components/ui/*` - shared UI primitives.
- `prisma/schema.prisma` - database schema.
- `src/app/admin/*` - existing admin screens, out of this plan except for avoiding regressions.

## Dependencies And Commands

Use PowerShell command syntax on this machine:

```powershell
npm.cmd install zod bcryptjs server-only @prisma/adapter-neon
npm.cmd run lint
npm.cmd run build
npx.cmd prisma generate
npx.cmd prisma db push
```

Expected stable verification:

- `npm.cmd run lint` exits 0.
- `npm.cmd run build` exits 0.
- Build output no longer includes the deprecated `middleware` warning.
- Build output no longer logs Prisma mock authentication fallback.

If the implementation workspace has no `.git` directory or `git` executable, skip commit commands and record that in the handoff. The current workspace has no `.git` directory and no `git` executable in PATH.

## Task 1: Establish Baseline And Install Runtime Dependencies

Files:

- `package.json`
- `package-lock.json`

Steps:

- [ ] Read the local Next.js docs in `node_modules/next/dist/docs/` before changing code. Required sections: project structure, layouts/pages, server and client components, fetching data, mutating data, caching, authentication, forms, fonts, images, and data security.
- [ ] Run `npm.cmd run lint` and save the result in the worker notes.
- [ ] Run `npm.cmd run build` and save the result in the worker notes.
- [ ] Install required packages:

```powershell
npm.cmd install zod bcryptjs server-only @prisma/adapter-neon
```

- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Dependency lockfile is updated.
- Existing lint status remains passing.
- Existing build status remains passing or only fails on already-known environment variables that are fixed in Task 2.

Commit:

```powershell
git add package.json package-lock.json
git commit -m "Add production runtime dependencies"
```

## Task 2: Fix Prisma 7 Client Initialization

Files:

- `src/lib/prisma.ts`

Replace the Prisma client setup with a Prisma 7 Neon adapter configuration:

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

Steps:

- [ ] Update `src/lib/prisma.ts`.
- [ ] Run `npx.cmd prisma generate`.
- [ ] Run `npm.cmd run build`.
- [ ] Confirm the build does not print `Failed to load PrismaAdapter, authentication is running in mock mode`.

Expected result:

- Prisma initializes through the Neon adapter.
- Server-side imports of `prisma` fail loudly when `DATABASE_URL` is absent.
- No mock auth fallback is needed.

Commit:

```powershell
git add src/lib/prisma.ts
git commit -m "Initialize Prisma with Neon adapter"
```

## Task 3: Replace Deprecated Middleware With Proxy

Files:

- `src/middleware.ts`
- `src/proxy.ts`

Steps:

- [ ] Move the route protection logic from `src/middleware.ts` to `src/proxy.ts`.
- [ ] Export the NextAuth wrapper from `src/proxy.ts` using the same matcher behavior for `/admin/:path*` and `/tai-khoan/:path*`.
- [ ] Delete `src/middleware.ts`.
- [ ] Run `npm.cmd run build`.
- [ ] Confirm build output no longer includes the Next.js middleware deprecation warning.

Expected result:

- Protected routes keep the same access rules.
- Next.js 16 route convention warning is gone.

Commit:

```powershell
git add src/proxy.ts
git rm src/middleware.ts
git commit -m "Move route protection to Next proxy convention"
```

## Task 4: Harden Auth And Registration

Files:

- `src/auth.config.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/(shop)/auth/dang-nhap/page.tsx`
- `src/app/(shop)/auth/dang-ky/page.tsx`
- `src/lib/auth/password.ts`
- `src/lib/auth/validation.ts`

Create `src/lib/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

const PASSWORD_COST = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_COST);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

Create `src/lib/auth/validation.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(120).toLowerCase(),
  password: z.string().min(1).max(72),
});
```

Steps:

- [ ] Update registration API to parse JSON through `registerSchema`.
- [ ] Hash new passwords with `hashPassword`.
- [ ] Return 400 for invalid registration input.
- [ ] Return 409 for duplicate email.
- [ ] Update credentials auth in `src/auth.config.ts` to use `loginSchema`, Prisma user lookup, and `verifyPassword`.
- [ ] Remove hardcoded demo credentials from `src/auth.config.ts`.
- [ ] Remove any UI quick-fill controls or visible demo credential text from login and registration pages.
- [ ] Preserve role data in JWT/session callbacks so admin route protection still works.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Passwords are never SHA-256 hashed.
- Demo credential bypass is removed.
- Register and login use the same normalization rules.
- Admin and customer session role behavior is unchanged.

Commit:

```powershell
git add src/auth.config.ts src/app/api/auth/register/route.ts src/app/(shop)/auth/dang-nhap/page.tsx src/app/(shop)/auth/dang-ky/page.tsx src/lib/auth
git commit -m "Harden customer authentication"
```

## Task 5: Add Payment Transaction Schema

Files:

- `prisma/schema.prisma`

Schema changes:

```prisma
enum PaymentProvider {
  COD
  VNPAY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  CANCELED
  REFUNDED
}

model PaymentTransaction {
  id              String          @id @default(cuid())
  orderId         String
  provider        PaymentProvider
  status          PaymentStatus   @default(PENDING)
  amount          Int
  currency        String          @default("VND")
  providerTxnRef  String?         @unique
  providerPayload Json?
  paidAt          DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([provider, status])
}
```

Also add this field to `Order`:

```prisma
payments PaymentTransaction[]
```

Steps:

- [ ] Add enums and model to `prisma/schema.prisma`.
- [ ] Add the `payments` relation to `Order`.
- [ ] Run `npx.cmd prisma generate`.
- [ ] Apply the schema to the development database:

```powershell
npx.cmd prisma db push
```

- [ ] Run `npm.cmd run build`.

Expected result:

- Prisma Client exposes `paymentTransaction`.
- Orders can have one or more payment attempts.
- No existing order fields are removed.

Commit:

```powershell
git add prisma/schema.prisma
git commit -m "Add payment transaction schema"
```

## Task 6: Create Customer Data Access Layer

Files:

- `src/data/catalog.ts`
- `src/data/orders.ts`
- `src/data/wishlist.ts`
- `src/data/account.ts`
- `src/data/types.ts`

Responsibilities:

- `src/data/catalog.ts`
  - `getHomeCatalogData()`
  - `getCatalogPageData(searchParams)`
  - `getWatchBySlug(slug)`
  - `getRelatedWatches(watchId, brandId, categoryId)`
- `src/data/orders.ts`
  - `validateCartItems(items)`
  - `createPendingOrder(input)`
  - `getCustomerOrders(userId)`
  - `getOrderForCustomer(orderId, userId)`
- `src/data/wishlist.ts`
  - `getCustomerWishlist(userId)`
  - `toggleWishlistItem(userId, watchId)`
- `src/data/account.ts`
  - `getCustomerAccount(userId)`
  - `updateCustomerProfile(userId, input)`
- `src/data/types.ts`
  - exported DTO types consumed by Client Components.

Steps:

- [ ] Add `import "server-only";` at the top of each data module.
- [ ] Map Prisma records into DTOs that contain only fields used by UI.
- [ ] Use integer VND prices from database records and format only at the UI layer.
- [ ] Exclude inactive or out-of-stock watches from purchasable catalog results.
- [ ] Keep any admin-specific data access out of these files.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Customer pages can stop importing `src/lib/mock-data.ts`.
- Client Components do not import Prisma.
- Data shape is explicit and serializable.

Commit:

```powershell
git add src/data
git commit -m "Add customer data access layer"
```

## Task 7: Convert Customer Catalog Pages To Real Data

Files:

- `src/app/(shop)/page.tsx`
- `src/app/(shop)/dong-ho/page.tsx`
- `src/app/(shop)/dong-ho/[slug]/page.tsx`
- `src/components/product/product-card.tsx`
- `src/components/product/product-grid.tsx`
- `src/components/product/product-detail.tsx`
- `src/lib/mock-data.ts`

Steps:

- [ ] Replace homepage mock imports with `getHomeCatalogData()`.
- [ ] Replace catalog mock imports with `getCatalogPageData(searchParams)`.
- [ ] Replace product detail mock imports with `getWatchBySlug(slug)` and `getRelatedWatches(...)`.
- [ ] Preserve current route URLs and Vietnamese labels.
- [ ] Add empty states for no catalog results and missing product slug.
- [ ] Make product card DTO-driven instead of mock-data-driven.
- [ ] Keep `src/lib/mock-data.ts` only if admin demo screens still import it; remove customer imports from it.
- [ ] Run a search command and confirm no customer page imports `src/lib/mock-data.ts`:

```powershell
rg "mock-data" src/app/\(shop\) src/components/product
```

- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Homepage, catalog, and PDP read real database data.
- No customer catalog route depends on mock watch data.
- Missing data renders a controlled user-facing state.

Commit:

```powershell
git add src/app/(shop)/page.tsx src/app/(shop)/dong-ho src/components/product src/lib/mock-data.ts
git commit -m "Connect customer catalog to database"
```

## Task 8: Implement Cart Validation And Checkout Server Action

Files:

- `src/app/(shop)/thanh-toan/page.tsx`
- `src/app/(shop)/thanh-toan/checkout-form.tsx`
- `src/app/actions/checkout.ts`
- `src/lib/checkout/validation.ts`
- `src/lib/store.ts`

Create `src/lib/checkout/validation.ts`:

```ts
import { z } from "zod";

export const checkoutItemSchema = z.object({
  watchId: z.string().min(1),
  quantity: z.number().int().min(1).max(5),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().max(120).toLowerCase(),
  customerPhone: z.string().trim().min(8).max(20),
  shippingAddress: z.string().trim().min(8).max(240),
  shippingCity: z.string().trim().min(2).max(80),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "VNPAY"]),
});
```

Steps:

- [ ] Create a Server Action `createCheckout` in `src/app/actions/checkout.ts`.
- [ ] Validate submitted data with `checkoutSchema`.
- [ ] Reprice every item from the database using `validateCartItems`.
- [ ] Reject missing, inactive, or out-of-stock items with a field-level error response.
- [ ] Create an order with status `PENDING`.
- [ ] Create `OrderItem` rows from the server-priced items.
- [ ] For COD, return a success redirect to an order confirmation page.
- [ ] For VNPAY, return a payment URL generated in Task 9.
- [ ] Keep localStorage cart as temporary UI state only; do not trust client totals.
- [ ] Clear local cart only after COD order creation or VNPAY paid return.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Checkout no longer simulates an order.
- Server owns price, stock, subtotal, discount, shipping, and grand total.
- Checkout supports both COD and VNPAY paths.

Commit:

```powershell
git add src/app/(shop)/thanh-toan src/app/actions/checkout.ts src/lib/checkout src/lib/store.ts
git commit -m "Create validated checkout flow"
```

## Task 9: Implement VNPAY Payment Integration

Files:

- `src/lib/payments/vnpay.ts`
- `src/app/api/payments/vnpay/ipn/route.ts`
- `src/app/(shop)/thanh-toan/ket-qua/page.tsx`
- `src/app/actions/checkout.ts`
- `.env.example`

Environment variables:

```env
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/thanh-toan/ket-qua
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Steps:

- [ ] Add `.env.example` entries without real secrets.
- [ ] Create `createVnpayPaymentUrl(order, transaction)` in `src/lib/payments/vnpay.ts`.
- [ ] Create `verifyVnpaySignature(searchParams)` in `src/lib/payments/vnpay.ts`.
- [ ] Use HMAC-SHA512 with sorted VNPAY parameters.
- [ ] Create a `PaymentTransaction` row before redirecting to VNPAY.
- [ ] Store VNPAY transaction reference in `providerTxnRef`.
- [ ] Implement IPN route at `src/app/api/payments/vnpay/ipn/route.ts`.
- [ ] IPN success behavior: verify signature, verify amount, mark transaction `PAID`, mark order `CONFIRMED`, set `paidAt`.
- [ ] IPN failure behavior: mark transaction `FAILED` when signature is valid and response code is not success.
- [ ] Return VNPAY-compatible JSON response codes from the IPN route.
- [ ] Implement customer return page at `/thanh-toan/ket-qua`.
- [ ] Return page verifies signature and renders paid, pending, or failed state without exposing raw gateway payload.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- VNPAY payment creation, IPN verification, and customer return state exist.
- Payment status updates are idempotent by `providerTxnRef`.
- Secrets are server-only.

Commit:

```powershell
git add .env.example src/lib/payments src/app/api/payments/vnpay src/app/(shop)/thanh-toan/ket-qua src/app/actions/checkout.ts
git commit -m "Integrate VNPAY checkout payments"
```

## Task 10: Connect Account, Orders, And Wishlist To Database

Files:

- `src/app/(shop)/tai-khoan/page.tsx`
- `src/app/(shop)/wishlist/page.tsx`
- `src/app/actions/account.ts`
- `src/app/actions/wishlist.ts`
- `src/components/account/*`
- `src/components/wishlist/*`

Steps:

- [ ] Require authenticated session for account and wishlist pages.
- [ ] Render profile information from `getCustomerAccount(userId)`.
- [ ] Render order history from `getCustomerOrders(userId)`.
- [ ] Render wishlist items from `getCustomerWishlist(userId)`.
- [ ] Add Server Action for updating customer profile.
- [ ] Add Server Action for toggling wishlist items.
- [ ] Keep optimistic UI only when server action success/failure is handled.
- [ ] Remove customer account and wishlist dependencies on mock data.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Account page shows real profile and order data.
- Wishlist persists to database for authenticated users.
- Unauthenticated users are routed through existing auth flow.

Commit:

```powershell
git add src/app/(shop)/tai-khoan src/app/(shop)/wishlist src/app/actions/account.ts src/app/actions/wishlist.ts src/components/account src/components/wishlist
git commit -m "Persist customer account and wishlist"
```

## Task 11: Apply Luxury Visual System To Customer UI

Files:

- `src/app/globals.css`
- `src/app/(shop)/layout.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/product/product-card.tsx`
- `src/components/product/product-grid.tsx`
- `src/components/product/product-detail.tsx`
- `src/app/(shop)/page.tsx`
- `src/app/(shop)/dong-ho/page.tsx`
- `src/app/(shop)/gio-hang/page.tsx`
- `src/app/(shop)/thanh-toan/page.tsx`
- `src/app/(shop)/auth/dang-nhap/page.tsx`
- `src/app/(shop)/auth/dang-ky/page.tsx`

Visual direction:

- Base: Atelier Noir.
- Accent: Collector Club.
- Background: black pearl, warm white, champagne metal, deep burgundy.
- Typography: editorial serif for major headings and precise sans-serif for UI.
- Layout: dense luxury retail, no marketing template hero cards, no nested UI cards.

Steps:

- [ ] Define CSS variables in `src/app/globals.css` for `--tempus-ink`, `--tempus-pearl`, `--tempus-champagne`, `--tempus-burgundy`, `--tempus-graphite`, and `--tempus-border`.
- [ ] Configure Next font usage in the root or shop layout using available `next/font` patterns from local docs.
- [ ] Update header to feel like a boutique navigation bar with clear account, wishlist, search, and cart affordances.
- [ ] Update homepage first viewport to show actual watches or real product imagery, not abstract gradients.
- [ ] Update product cards with fixed image aspect ratio, restrained borders, clear price hierarchy, brand, reference, availability, and wishlist action.
- [ ] Update catalog filters with compact controls designed for repeated shopping use.
- [ ] Update product detail with editorial product image area, purchase panel, service guarantee, authenticity, warranty, and specification sections.
- [ ] Update cart and checkout screens for side-by-side review on desktop and single-column flow on mobile.
- [ ] Update auth screens to match the luxury system and remove demo credential language.
- [ ] Check CSS colors to avoid a one-note palette:

```powershell
rg "#|rgb|hsl|oklch|var\(--" src/app src/components
```

- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- Customer UI reads as a premium watch retailer.
- Text does not overlap controls on mobile or desktop.
- The visual direction is consistent across customer entry, browsing, cart, checkout, account, and auth.

Commit:

```powershell
git add src/app/globals.css src/app/(shop) src/components/layout src/components/product
git commit -m "Refresh customer UI with luxury design system"
```

## Task 12: Add Focused Tests Or Verification Scripts

Files:

- `src/lib/auth/password.ts`
- `src/lib/auth/validation.ts`
- `src/lib/checkout/validation.ts`
- `src/lib/payments/vnpay.ts`
- test files matching the existing test framework if one exists.

Steps:

- [ ] Inspect the repository for an existing test runner.
- [ ] If a test runner exists, add unit tests for password validation, checkout schema validation, VNPAY signature generation, and VNPAY signature verification.
- [ ] If no test runner exists, add a minimal `npm` script for the repo's chosen runner and include the four unit test groups.
- [ ] Run the unit test command.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.

Expected result:

- High-risk payment and validation logic has automated coverage.
- Existing lint and build remain passing.

Commit:

```powershell
git add package.json package-lock.json src/**/*.test.ts src/**/*.spec.ts
git commit -m "Test payment and validation logic"
```

## Task 13: End-To-End Customer Verification

Manual verification path:

- [ ] Register a new customer.
- [ ] Log in as that customer.
- [ ] Open homepage and confirm real catalog data renders.
- [ ] Open catalog and filter by brand, category, price, and availability.
- [ ] Open product detail and add item to cart.
- [ ] Open cart and change quantity.
- [ ] Submit checkout with COD and confirm order appears in account history.
- [ ] Submit checkout with VNPAY sandbox and confirm redirect URL is created.
- [ ] Simulate VNPAY IPN success and confirm order status changes to `CONFIRMED`.
- [ ] Simulate VNPAY IPN failure and confirm transaction status changes to `FAILED`.
- [ ] Add and remove wishlist item and refresh the page to confirm persistence.
- [ ] Visit `/admin` as a customer and confirm access is denied.
- [ ] Visit `/tai-khoan` while logged out and confirm auth redirect.

Command verification:

```powershell
npm.cmd run lint
npm.cmd run build
rg "mock-data" src/app/\(shop\) src/components/product src/components/account src/components/wishlist
rg "admin123|minh123|createHash|sha256" src
```

Expected result:

- Lint passes.
- Build passes.
- Customer-facing mock-data search returns no matches.
- Hardcoded credential and SHA-256 password search returns no matches.

Final commit:

```powershell
git add .
git commit -m "Complete customer-first luxury rebuild phase"
```

## Rollback Plan

- Revert the most recent task commit when a task introduces a regression.
- If Prisma schema update fails, restore `prisma/schema.prisma` to the previous commit and rerun `npx.cmd prisma generate`.
- If VNPAY integration fails verification, keep COD checkout working and revert only `src/lib/payments`, `src/app/api/payments/vnpay`, and `/thanh-toan/ket-qua`.
- If visual refresh creates layout regressions, revert Task 11 and keep completed data/auth/payment work.

## Handoff Criteria

The implementation is complete when:

- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- No customer-facing route imports `src/lib/mock-data.ts`.
- No hardcoded demo credentials remain in `src`.
- Registration uses bcryptjs hashing.
- Prisma initializes without mock fallback.
- VNPAY payment transaction creation, IPN, and return page are implemented.
- Homepage, catalog, product detail, cart, checkout, account, and wishlist all render production data or controlled empty states.
- Customer UI follows the Atelier Noir + Collector Club luxury direction.
- Remaining admin rebuild work is documented as Phase 2, not mixed into this customer-first release.
