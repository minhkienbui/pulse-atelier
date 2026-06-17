# Pulse Atelier Frontend Design

Date: 2026-06-16
Status: Draft for user review

## Summary

Pulse Atelier is a new standalone frontend-first ecommerce website for premium personal smart electronics. It will be created as a separate Next.js app at `apps/pulse-atelier`, leaving the existing Tempus watch shop intact.

The product focus is personal smart devices: smartwatches, earbuds, fitness bands, tablets, and smart accessories. The brand direction is a premium tech boutique, using the approved Pulse Atelier visual identity: dark graphite surfaces, clean product-led layouts, mint and violet accents, and editorial but practical shopping flows.

The first phase is a complete frontend demo with structured mock data. Customer, account, checkout, and admin workflows should feel real, but they will not connect to a database, real authentication, or payment provider yet. Backend integration can happen after the frontend experience is approved.

## Approved Decisions

- Build a new website/app, not a conversion of the existing Tempus shop.
- Use `apps/pulse-atelier` as a separate app.
- Build frontend first, then connect full-stack features later.
- Focus on personal smart electronics.
- Position the shop as a premium tech boutique.
- Use the visual direction named Pulse Atelier.
- Include a full admin demo, not a light dashboard preview.
- Use structured mock data and local client state for the first phase.

## Current Project Context

The current repository is a Next.js 16.2.7 project with React 19, Prisma, NextAuth, Zustand, Radix UI, Chart.js, lucide-react, and Tailwind CSS 4. It already contains a Tempus luxury watch ecommerce experience with customer and admin routes.

Pulse Atelier should not refactor or replace that work. It should live as a sibling app under `apps/pulse-atelier`.

The repository has an `AGENTS.md` instruction requiring local Next.js documentation to be read before writing code because this Next.js version may differ from familiar conventions. Implementation must read the relevant docs in `node_modules/next/dist/docs/` before coding the app.

Git is not currently available in PATH in this environment, so committing the design document may not be possible from this session.

## Goals

1. Create a polished standalone frontend demo for Pulse Atelier.
2. Cover full customer, account, checkout, and admin workflows.
3. Make the interface feel like a premium tech boutique rather than a generic electronics shop.
4. Use typed mock data that can later be replaced with API or database-backed modules.
5. Keep the app independent enough that the existing Tempus storefront remains stable.

## Non-Goals For Phase 1

- Real database persistence.
- Real authentication or role enforcement.
- Real payment processing.
- Production inventory reservation.
- Email, SMS, or push notifications.
- Shipping carrier integration.
- Shared monorepo package extraction.
- Rebuilding the existing Tempus shop.

## App Structure

Pulse Atelier should be created at:

```text
apps/pulse-atelier/
```

Recommended structure:

```text
apps/pulse-atelier/
  package.json
  next.config.ts
  tsconfig.json
  src/app/
  src/components/
  src/data/
  src/stores/
  src/types/
  src/lib/
  public/
```

Recommended source organization:

```text
src/app/
  page.tsx
  san-pham/page.tsx
  san-pham/[slug]/page.tsx
  so-sanh/page.tsx
  gio-hang/page.tsx
  thanh-toan/page.tsx
  tai-khoan/page.tsx
  dang-nhap/page.tsx
  admin/page.tsx
  admin/san-pham/page.tsx
  admin/don-hang/page.tsx
  admin/khach-hang/page.tsx
  admin/kho/page.tsx
  admin/ma-giam-gia/page.tsx
  admin/danh-gia/page.tsx
  admin/ho-tro/page.tsx
  admin/noi-dung/page.tsx
  admin/cai-dat/page.tsx

src/components/
  layout/
  product/
  cart/
  checkout/
  account/
  admin/
  finder/
  compare/
  ui/

src/data/
  products.ts
  categories.ts
  brands.ts
  customers.ts
  orders.ts
  admin.ts
  content.ts

src/stores/
  cart-store.ts
  wishlist-store.ts
  compare-store.ts
  demo-session-store.ts
  admin-demo-store.ts
```

## Customer Features

### Home

The homepage should immediately communicate Pulse Atelier as a premium wearable and smart device boutique. It should include:

- Product-led hero.
- Clear CTAs for browsing products and using Rhythm Finder.
- Featured categories: smartwatches, earbuds, fitness bands, tablets, smart accessories.
- Featured products and curated bundles.
- Trust blocks for warranty, compatibility checks, return policy, and expert curation.
- A compact editorial section for buying guides.

### Catalog

The catalog page should support:

- Search by product name, brand, and feature.
- Category filter.
- Brand filter.
- Ecosystem filter: iOS, Android, Windows, cross-platform.
- Use-case filter: fitness, work, study, travel, focus, gaming.
- Price range filter.
- Sort by featured, newest, price, rating, battery life, and popularity.
- Grid/list responsive layout.
- Empty state when filters return no results.

### Product Detail

Each product detail page should show:

- Product media area with stable aspect ratio.
- Brand, category, name, price, availability, and badges.
- Add to cart, wishlist, compare, and buy now actions.
- Smart-device specifications: battery life, compatibility, connectivity, sensors, water resistance, ANC when relevant, weight, warranty.
- Compatibility notes before checkout.
- Review summary and rating breakdown.
- Recommended alternatives and bundles.

### Rhythm Finder

Rhythm Finder is the signature customer feature. It asks what the customer is buying for and maps needs to products:

- Work and focus.
- Fitness and health.
- Travel.
- Study.
- Entertainment.
- Everyday lightweight use.

It should return recommended devices and explain why each device fits the selected rhythm.

### Compare Lab

Compare Lab lets customers compare two to four products side by side. It should highlight:

- Price.
- Battery life.
- Ecosystem.
- Connectivity.
- Comfort or weight.
- Sensors and health features.
- ANC or audio features for earbuds.
- Warranty.
- Best-fit use cases.

### Cart And Checkout Demo

The cart should support quantity changes, removal, coupon entry, order summary, and suggested bundles. Checkout should be a frontend demo that validates fields and creates a mock confirmation state.

Checkout fields:

- Customer name.
- Email.
- Phone.
- Shipping address.
- Demo payment method selection.
- Note.
- Coupon code.

### Account

The account area should include:

- Profile overview.
- Saved addresses.
- Order history.
- Wishlist.
- Compare history or recently viewed products.
- Warranty/support requests.
- Owned devices derived from mock completed orders.

## Admin Features

The admin demo should be broad enough to feel operational.

### Dashboard

Show:

- Revenue.
- Orders.
- Conversion.
- Returning customers.
- Low-stock products.
- Top products.
- Recent orders.
- Support queue.
- Simple charts.

### Product Management

Admin product screens should include:

- Product table with filters.
- Add/edit product demo form.
- Category, brand, price, stock, image, badges, compatibility, specs, and tags.
- Publish/draft state.
- Low-stock indicators.

### Orders

Order management should include:

- Order list with status filters.
- Order detail drawer or page.
- Customer info.
- Items.
- Fulfillment status.
- Demo payment status.
- Admin note.
- Demo status update actions.

### Customers

Customer management should show:

- Customer list.
- Customer segment.
- Order count.
- Lifetime spend.
- Wishlist count.
- Support tickets.
- Customer detail view.

### Inventory

Inventory should show:

- Stock on hand.
- Demo reserved-stock value.
- Low-stock threshold.
- Recent stock movements.
- Demo adjustment action.

### Coupons

Coupon management should include:

- Coupon list.
- Code, discount type, amount, usage, active dates, active state.
- Create/edit demo form.

### Reviews

Review moderation should include:

- Review list.
- Rating.
- Product.
- Customer.
- Status.
- Approve/hide demo actions.

### Support And Warranty

Support should include:

- Ticket list.
- Warranty request list.
- Status.
- Priority.
- Demo assigned staff value.
- Demo reply/status action.

### Content

Content management should include:

- Hero banners.
- Buying guides.
- Blog articles.
- Featured collection slots.

### Settings

Settings should include demo-only controls for:

- Store profile.
- Shipping fees.
- Return policy.
- Warranty copy.
- Payment method labels.

## Data Model For Mock Data

The mock data should use typed objects so it can be swapped later with real data access modules.

Core entities:

- Product.
- Brand.
- Category.
- Customer.
- Order.
- OrderItem.
- Review.
- InventoryMovement.
- Coupon.
- SupportTicket.
- Article.
- HeroBanner.
- AdminMetric.

Product-specific smart device fields:

- Ecosystem.
- Battery life.
- Connectivity.
- Water resistance.
- Sensors.
- ANC.
- Weight.
- Warranty.
- Compatibility notes.
- Use-case tags.
- Bundle suggestions.

## State Management

Phase 1 should use client state for demo interactivity:

- Cart state.
- Wishlist state.
- Compare state.
- Demo user/session state.
- Admin demo mutations.

State does not need durable persistence beyond local storage where useful. The UI should still behave as if actions succeeded: add to cart, remove item, update order status, moderate review, and apply coupon.

## Visual Design

The approved visual direction is Pulse Atelier.

Color tokens:

- Obsidian: `#101418`
- Graphite: `#151B21`
- Pulse Mint: `#88F0D0`
- Signal Violet: `#6D7CFF`
- Frost: `#EEF6F7`
- Soft Steel: `#AAB8BF`

Design rules:

- Keep customer pages product-led.
- Avoid generic discount-heavy marketplace styling.
- Use compact, precise controls.
- Use stable product image ratios.
- Use lucide icons for recognizable actions.
- Keep cards at 8px radius or less.
- Do not nest cards inside cards.
- Admin UI should be dense and operational, not cinematic.
- Ensure mobile text and controls do not overlap.

Signature visual element:

- Rhythm Finder: an interactive product recommendation module based on lifestyle rhythm.

## Error And Empty States

Required states:

- No products found.
- Product not found.
- Empty cart.
- Empty wishlist.
- Not enough items to compare.
- Invalid checkout form.
- Coupon invalid or expired.
- Admin table empty.
- Demo action success.
- Demo action failure.
- Unauthorized demo state for admin/account when using demo login state.

Errors should tell the user what to do next rather than only stating that something failed.

## Testing And Verification

Before implementation:

- Read local Next.js 16 docs from `node_modules/next/dist/docs/` relevant to app structure, routing, Server and Client Components, fonts, images, forms, and data security.

After implementation:

- Run lint for the Pulse Atelier app.
- Run build for the Pulse Atelier app.
- Open the app in a browser.
- Verify desktop and mobile layouts.
- Verify customer flows: home, catalog, product detail, Rhythm Finder, Compare Lab, cart, checkout, account.
- Verify admin flows: dashboard, products, orders, customers, inventory, coupons, reviews, support, content, settings.
- Check that text fits in buttons, cards, filters, and tables on mobile.
- Check that product images and mock media render.
- Search CSS colors to ensure the palette is not one-note and matches the approved direction.

## Acceptance Criteria

Phase 1 is complete when:

- `apps/pulse-atelier` exists as a standalone Next app.
- The existing Tempus shop still exists and is not converted into Pulse Atelier.
- Customer pages are navigable and visually complete.
- Account pages are navigable and visually complete.
- Cart, wishlist, compare, and checkout demo interactions work.
- Admin pages cover dashboard, products, orders, customers, inventory, coupons, reviews, support, content, and settings.
- Mock data is typed and centralized.
- The approved Pulse Atelier visual system is applied consistently.
- Lint and build pass for the new app.
- Desktop and mobile browser checks pass for major flows.

## Later Backend Phase

After the frontend is approved, the next phase can replace mock modules with real data and services:

- Database schema.
- Authentication and role-based access.
- Persistent cart, wishlist, and compare.
- Real checkout and payment provider.
- Order lifecycle.
- Inventory reservation.
- Admin CRUD.
- Review and support persistence.
- Content CMS persistence.
