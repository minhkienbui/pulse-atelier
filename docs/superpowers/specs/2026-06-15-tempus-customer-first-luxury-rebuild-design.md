# Tempus.vn Customer-First Luxury Rebuild Design

Date: 2026-06-15
Status: Draft for user review

## Summary

Tempus.vn is currently a visually complete luxury watch e-commerce prototype built with Next.js 16.2.7, React 19.2.4, Tailwind CSS 4, NextAuth v5 beta, Prisma 7.8, Zustand, Framer Motion, and Chart.js.

The project already has customer routes, admin routes, auth scaffolding, a Prisma schema, mock watch data, cart and wishlist stores, and a dark luxury visual style. The main gap is operational readiness: most customer and admin workflows are powered by mock data, local component state, or localStorage rather than a persistent database-backed commerce flow.

The approved direction is a customer-first luxury relaunch:

- Rebuild the customer experience first so browsing, checkout, account, wishlist, and warranty flows use real data.
- Use VNPAY as the first real payment provider.
- Redesign the customer UI around an Atelier Noir visual identity, with Collector Club moments for high-value products.
- Keep the architecture open for a full admin rebuild in phase 2.

## Current Findings

### Strengths

- The app already uses the Next.js App Router and route groups.
- The Prisma schema covers most required commerce concepts: users, brands, categories, watches, suppliers, inventory transactions, orders, coupons, reviews, wishlists, notifications, blogs, and service requests.
- Customer pages already exist for home, catalog, product detail, cart, checkout, login, register, account, warranty, blog, brands, and contact.
- Admin pages already exist for dashboard, products, brands, categories, orders, reviews, warranty, inventory, suppliers, users, and blog.
- The UI has an established dark luxury direction, reusable global styles, and basic component patterns.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

### Critical Gaps

- Many customer pages import `src/lib/mock-data.ts` directly.
- Admin CRUD screens mutate component state and lose changes on refresh.
- Cart and wishlist are stored in client localStorage only.
- Checkout currently simulates order creation instead of writing an order to the database.
- VNPAY integration does not exist yet.
- Auth credentials currently include mock accounts and do not verify database users.
- Register uses plain SHA-256 password hashing, which is not sufficient for production.
- `PrismaAdapter` fails during build and auth falls back to mock mode.
- `middleware.ts` builds with a deprecation warning and should move to `proxy.ts` for this Next.js version.
- Several Vietnamese strings in source display mojibake; this must be fixed before polish and SEO work.

## Goals

1. Make the customer journey real end to end.
2. Preserve and improve luxury perception through a distinctive visual system.
3. Centralize data access and authorization so customer features are safe to extend.
4. Add VNPAY payment while keeping room for later MoMo, ZaloPay, Stripe, or PayPal providers.
5. Prepare the app for a full admin rebuild after customer flows are stable.

## Non-Goals For Phase 1

- Full admin CRUD rebuild.
- Full blog CMS.
- Automated email or SMS workflows.
- Multi-provider payment support.
- Shipping carrier integration.
- Advanced warehouse reservation expiry.
- Detailed role-permission matrix beyond ADMIN, STAFF, and CUSTOMER.

## Technical Architecture

### App Structure

The app should keep the current route groups:

- `src/app/(shop)` for customer routes.
- `src/app/admin` for admin routes.
- `src/app/api` for payment callbacks and auth route handlers where needed.

Customer pages should become Server Components by default where they read data. Client Components should be limited to actual browser interactivity, such as:

- Header menu state.
- Search overlay.
- Mobile filter drawer.
- Product gallery.
- Quantity controls.
- Cart interaction.
- Checkout form pending state.
- Wishlist buttons.

### Data Access Layer

Create a server-only data layer, for example:

- `src/data/catalog.ts`
- `src/data/customer.ts`
- `src/data/orders.ts`
- `src/data/wishlist.ts`
- `src/data/service.ts`
- `src/data/payments/vnpay.ts`
- `src/data/auth.ts`

These modules should:

- Import Prisma only on the server.
- Use `server-only`.
- Perform authorization close to the data source.
- Return safe DTOs instead of raw database records.
- Validate route params and search params.
- Keep secret and environment access out of Client Components.

### Server Actions

Use thin Server Action files to handle mutations:

- `updateCustomerProfile`
- `addWishlistItem`
- `removeWishlistItem`
- `createCheckoutOrder`
- `createWarrantyRequest`
- `retryVnpayPayment`

Each action must:

- Re-check authentication and authorization.
- Validate input server-side.
- Call the DAL for database work.
- Return only UI-safe results.
- Revalidate affected routes or tags.

### Next.js 16 Considerations

Local Next.js docs for this installed version show several important conventions:

- Pages and layouts are Server Components by default.
- Client Components should be used only for state, event handlers, browser APIs, and hooks.
- Server Actions are reachable via direct POST requests and must check auth inside the action.
- Data fetching should be centralized through a DAL for new projects.
- `middleware.ts` is deprecated in the current build output and should move to `proxy.ts`.
- Cache and runtime data need explicit handling via Suspense, cache directives, and revalidation.

## Customer Features

### Home

Home becomes a real storefront, not a static prototype.

It should display:

- Atelier Noir hero with real product imagery.
- Featured watches from `Watch.isFeatured`.
- Limited or collector-grade watches from `Watch.isLimited`.
- Active brands.
- Recent published blog or journal entries.
- Trust blocks for authenticity, warranty, insured shipping, and private consultation.

Primary CTAs:

- Explore collection.
- Book private viewing.

### Catalog

Catalog should query the database from URL search parameters.

Filters:

- Brand.
- Category.
- Movement.
- Price range.
- Case size.
- Material.
- Featured.
- Limited.
- In stock.

Sort options:

- Newest.
- Price ascending.
- Price descending.
- Best selling.
- Name A-Z.

Requirements:

- Filters are reflected in the URL.
- Empty state explains how to broaden filters.
- Mobile filter drawer is a Client Component.
- Product grid uses stable image aspect ratios.
- Pagination or cursor loading is required once product count grows.

### Product Detail

Product detail uses slug lookup and returns not found for inactive or missing products.

It should display:

- Product gallery.
- Brand and category links.
- Name, SKU, price, original price, stock, badges.
- Specifications: movement, case material, dial color, water resistance, case size, strap material, warranty.
- Approved reviews.
- Related watches.
- Add to cart.
- Wishlist.
- Buy now.
- Authenticity and service information.

High-value or limited products should also show a Reference Dossier:

- Calibre.
- Serial verification status or wording.
- Warranty length.
- Provenance or authenticity note.
- Private viewing CTA.

### Cart

The cart may remain client-side before checkout for speed, but checkout cannot trust client state.

Cart items should store:

- Watch id.
- Quantity.
- Basic display snapshot.

At checkout, the server must reload each watch and verify:

- Product exists.
- Product is active.
- Stock is sufficient.
- Price has not changed, or the UI explicitly asks the customer to accept changed prices.

### Checkout

Checkout collects:

- Shipping name.
- Shipping phone.
- Shipping email.
- Shipping address.
- Note.
- Payment method.
- Coupon code if active.

The first real payment provider is VNPAY.

Checkout flow:

1. User submits checkout form.
2. Server validates session or creates a guest policy if guest checkout is allowed later.
3. Server validates cart against database.
4. Server creates an `Order` with status `PENDING`.
5. Server stores `OrderItem` rows with price snapshots.
6. Server creates a VNPAY transaction record.
7. Server signs the VNPAY payment URL.
8. User is redirected to VNPAY.
9. Return page shows pending, success, or failure.
10. IPN verifies the transaction and updates payment/order state.

Phase 1 should assume logged-in checkout unless guest checkout is explicitly added later.

### Account

Account uses real customer data.

Tabs:

- Profile.
- Orders.
- Owned watches.
- Wishlist.
- Warranty requests.

Profile:

- Name.
- Phone.
- Address.
- Email read-only unless email change flow is added.

Orders:

- Order number.
- Date.
- Status.
- Payment status.
- Total.
- Items.
- Retry payment when allowed.

Owned watches:

- Derived from completed or paid orders.
- Includes product, purchase date, serial number when available, and warranty information.

Warranty requests:

- List user service requests.
- Create request for owned watch.
- Show status and admin note when available.

### Warranty And Service

Customers can submit service requests.

Rules:

- Authenticated users can request service for owned watches.
- If a user does not have an owned watch, they can submit a consultation request only if that workflow is explicitly supported.
- Request status starts as `PENDING`.
- Admin processing is phase 2, but the customer-facing request tracking should be real in phase 1.

## Payment Design

### PaymentTransaction Model

The current schema should add a dedicated payment transaction model. Recommended fields:

- `id`
- `orderId`
- `provider`
- `providerTxnRef`
- `amount`
- `currency`
- `status`
- `bankCode`
- `responseCode`
- `transactionNo`
- `payDate`
- `rawPayload`
- `createdAt`
- `updatedAt`

Recommended statuses:

- `PENDING`
- `SUCCESS`
- `FAILED`
- `CANCELLED`
- `EXPIRED`

This avoids overloading `Order.status`, which should continue representing operational fulfillment.

### VNPAY Verification

VNPAY return and IPN handlers must:

- Rebuild the signed payload exactly.
- Verify secure hash.
- Verify amount.
- Verify order number.
- Check transaction idempotency.
- Never mark an order paid from an unverified client request.
- Handle duplicate callbacks safely.

## Auth And Security

### Auth

Current mock credential auth must be replaced with database-backed credentials.

Requirements:

- Use PrismaAdapter only after Prisma initialization is fixed.
- Use bcrypt or argon2 for password hashing.
- Remove hardcoded demo credentials from production code.
- Keep role in JWT/session.
- Check roles in server-side data access and actions.

### Authorization

Every Server Action and Route Handler must verify:

- User is logged in when required.
- User owns the resource being read or changed.
- Staff/admin role is present for administrative actions.

Middleware or proxy checks are useful for navigation, but they are not sufficient security for mutations.

### Validation

Use schema validation for:

- Checkout form.
- Profile update.
- Warranty request.
- Wishlist mutation.
- Catalog search params.
- Payment return/IPN params.

Zod is recommended if added to the project.

## Visual Design

### Direction

The approved direction is Atelier Noir with Collector Club moments.

This means:

- Dark, restrained, product-led visuals.
- Fewer glow/orb decorations.
- More real product photography.
- More trust and collector language.
- Less generic black-and-gold luxury symbolism.

### Color Tokens

- Obsidian: `#070706`
- Carbon: `#12110F`
- Ivory Dial: `#F3EAD7`
- Champagne Gold: `#D2B66C`
- Steel Blue: `#7E95A0`
- Oxide Red: `#8B3F35`

### Typography

Display serif:

- Hero headline.
- Product names.
- Editorial headings.
- Key trust statements.

Body sans:

- Product descriptions.
- Forms.
- Checkout.
- Account pages.
- Navigation.

Utility mono or mono-like treatment:

- SKU.
- Reference.
- Serial.
- Calibre.
- Payment code.

Do not use negative letter spacing. Keep compact headings and buttons readable on mobile.

### Layout Rules

- Home and product detail should be image-led.
- Catalog should be efficient and scannable.
- Checkout should be calm and low-animation.
- Account should be functional and status-oriented.
- Admin phase 2 should be dense, operational, and restrained.
- Cards should use small radius, not large rounded marketing cards.
- Avoid nested cards.
- Avoid decorative orbs and generic bokeh.
- Use stable dimensions for product cards, galleries, filters, and checkout summaries.

### Signature Element

The unique design element is the Reference Dossier.

It appears on high-value product pages and contains:

- Calibre.
- Case size.
- Serial verification.
- Warranty.
- Authenticity note.
- Private viewing CTA.

This element comes from the watch collecting domain and should replace generic luxury decoration.

## Admin Phase 2

Admin should be rebuilt after customer phase 1 is stable.

Scope:

- Dashboard with real revenue, order, stock, and payment metrics.
- Product CRUD.
- Brand CRUD.
- Category CRUD.
- Order management.
- Payment transaction review.
- Inventory transactions.
- Supplier management.
- User and role management.
- Review moderation.
- Warranty/service processing.
- Blog CMS.

Admin pages should use the same design language, but they should prioritize speed, density, and clarity over cinematic presentation.

## Roadmap

### Phase 0: Foundation Stabilization

- Fix Vietnamese text encoding.
- Fix Prisma client initialization.
- Replace mock credential auth with database credential auth.
- Replace SHA-256 password hashing with bcrypt or argon2.
- Move deprecated `middleware.ts` to the current proxy convention.
- Add DAL structure.
- Add environment validation for required production secrets.

### Phase 1: Customer-First Real Commerce

- Database-backed home sections.
- Database-backed catalog.
- Database-backed product detail.
- Cart revalidation on checkout.
- VNPAY order creation and callback handling.
- Customer account data.
- Wishlist persistence.
- Warranty request persistence.
- Atelier Noir customer redesign.

### Phase 2: Admin Operations

- Replace admin local state with database-backed CRUD.
- Add order and payment management.
- Add inventory transaction workflows.
- Add service request processing.
- Add dashboard metrics.

### Phase 3: Trust And Growth

- Email notifications.
- SMS or chat integration if needed.
- Invoice generation.
- Sitemap and metadata improvements.
- Blog CMS and SEO content workflow.
- Review capture after completed orders.
- Product image management.
- Promotion and coupon workflows.

### Phase 4: Scale

- Multi-provider payments.
- Shipping carrier integration.
- Inventory reservation expiry.
- Audit logs.
- Detailed staff permissions.
- More durable caching and performance tuning.

## Testing And Verification

Required checks:

- `npm.cmd run lint`
- `npm.cmd run build`
- Manual customer flow: catalog to product to cart to checkout.
- VNPAY sandbox success callback.
- VNPAY sandbox failed callback.
- VNPAY duplicate callback handling.
- Customer account order history.
- Wishlist add/remove.
- Warranty request create/list.
- Mobile and desktop visual pass for home, catalog, product, checkout, account.
- Search for mojibake patterns on customer routes.

## Error Handling

Customer-facing errors must explain the next action.

Required states:

- Product not found.
- Product inactive.
- Out of stock.
- Requested quantity exceeds stock.
- Price changed since added to cart.
- Coupon invalid or expired.
- VNPAY signature invalid.
- VNPAY payment failed.
- Payment already processed.
- Session expired.
- Unauthorized account access.
- Warranty request for non-owned watch.

## Acceptance Criteria

Phase 1 is complete when:

- No customer route depends on `src/lib/mock-data.ts`.
- Product browsing uses Prisma data.
- Product detail uses Prisma data.
- Checkout creates a real order.
- VNPAY success and failure are handled.
- Customer can see real orders in account.
- Wishlist is persisted for logged-in users.
- Warranty requests are persisted for logged-in users.
- Mojibake is removed from customer-visible copy.
- Lint and production build pass.
- Desktop and mobile customer screens match the approved Atelier Noir direction.

## Open Assumptions

- Phase 1 requires logged-in checkout.
- VNPAY sandbox credentials will be provided before implementation.
- Existing Prisma schema can be migrated; destructive database resets are not assumed.
- Product images may continue using remote URLs initially, with stricter image hosting later.
- Full admin persistence is phase 2, except for the minimum order/payment visibility needed to verify phase 1.
