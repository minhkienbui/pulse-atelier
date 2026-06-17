# Pulse Atelier Auth Orders Admin CRUD Design

## Goal

Replace all demo account, checkout, and admin-management wording/behavior with a production-shaped frontend flow:

- Separate login for normal users and admin users.
- Real order creation inside the frontend app state instead of demo checkout copy.
- Order tracking after successful checkout.
- Add, edit, and delete controls across admin management sections.

This remains a frontend-only implementation. Without a backend, database, payment gateway credentials, and server callbacks, persistence will use browser localStorage and in-memory Zustand state. The UI should no longer describe itself as "demo", but it must not pretend to charge cards or contact a real bank.

## Current State

Pulse Atelier currently has:

- `useDemoSessionStore` with role-switch methods `loginAsCustomer()` and `loginAsAdmin()`.
- `/dang-nhap` with demo customer/admin buttons.
- `/thanh-toan` that says checkout demo and creates `PA-DEMO-*`.
- Customer account pages that read seeded customer/order data.
- Admin pages with update actions, but not complete add/edit/delete coverage.
- Mock data in `src/data/*` and local client stores in `src/stores/*`.

## Proposed Approach

Use a frontend-real model:

- Add a typed auth/account layer with seeded credentials.
- Add an order store that creates and persists new orders from checkout.
- Make account and tracking pages read from user-owned orders.
- Expand admin store with CRUD methods for products, orders, customers, coupons, reviews, tickets, and content where applicable.
- Keep checkout payment choices limited to realistic non-gateway states: cash on delivery, bank transfer instructions, and card payment marked unavailable until backend/payment provider exists.

This gives the user a real app-like workflow while staying honest about frontend-only limitations.

## Auth Design

Create a new auth store to replace `demo-session-store`:

- User account:
  - Email: `user@pulse.vn`
  - Password: `123456`
  - Role: `user`
  - Linked customer profile: `cust-minh-anh`
- Admin account:
  - Email: `admin@pulse.vn`
  - Password: `admin123`
  - Role: `admin`

Behavior:

- `/dang-nhap` becomes a real login form with email and password.
- Incorrect credentials show inline errors.
- Successful user login routes to `/tai-khoan`.
- Successful admin login routes to `/admin`.
- Logout clears auth state.
- Account-only pages show a login-required state if unauthenticated.
- Admin pages show an admin-login-required state if the current account is not admin.

## Order And Checkout Design

Checkout should stop using "demo" language:

- Page title/copy becomes "Thanh toan" and "Hoan tat don hang".
- Payment methods:
  - `cod`: Thanh toan khi nhan hang.
  - `bank`: Chuyen khoan ngan hang with transfer instructions.
  - `card`: show "Can tich hop cong thanh toan" and keep disabled or marked unavailable.
- Valid checkout creates a new order:
  - Order number format: `PA-YYYYMMDD-####`.
  - Status starts as `pending`.
  - Payment status starts as `pending`.
  - Items, totals, coupon, customer contact, shipping address, note, and createdAt are stored.
- After successful checkout:
  - Cart is cleared.
  - Confirmation shows order number, total, payment method, and next status.
  - User can open `/theo-doi-don-hang?order=<orderNumber>`.

## Order Tracking Design

Add `/theo-doi-don-hang`:

- Search by order number.
- If logged in, list the user's recent orders.
- Show a timeline:
  - `pending`: Da tiep nhan.
  - `confirmed`: Da xac nhan.
  - `packed`: Dang dong goi.
  - `shipping`: Dang giao.
  - `completed`: Hoan tat.
  - `cancelled`: Da huy.
- Show order items, totals, shipping address, and support CTA.
- Unknown order numbers show an empty/error state.

## Customer Account Design

`/tai-khoan` should become a user account page:

- Remove "demo customer" wording.
- Show logged-in user profile.
- Show saved address.
- Show order history from both seeded orders and newly created orders.
- Show order tracking links for each order.
- Show wishlist, compared products, owned devices, and support tickets.

## Admin CRUD Design

Admin pages should keep their current dense operational style but add add/edit/delete:

- Products:
  - Add product form with SKU, name, category, price, stock, status, badges.
  - Edit selected product fields.
  - Delete selected product with a non-blocking confirmation panel.
- Orders:
  - Add manual order.
  - Edit status/payment status.
  - Delete/cancel order.
- Customers:
  - Add customer.
  - Edit name, email, phone, segment, address.
  - Delete customer if no active order is selected, otherwise show a warning.
- Inventory:
  - Add inventory movement.
  - Edit stock adjustment.
  - Delete movement from local state.
- Coupons:
  - Add coupon.
  - Edit code/type/value/limits/status.
  - Delete coupon.
- Reviews:
  - Add internal review.
  - Edit status/content.
  - Delete review.
- Support:
  - Add ticket.
  - Edit priority/status/assignee.
  - Delete ticket.
- Content:
  - Add/edit/delete hero banners and article teasers.
- Settings:
  - Edit store settings and reset to defaults.

All CRUD operations persist in localStorage for this frontend-only version.

## Data Flow

- `auth-store` owns current account identity.
- `order-store` owns newly created orders and merges them with seeded orders for user/admin views.
- `admin-store` owns mutable catalog/admin entities and persists CRUD changes.
- Pure helpers in `src/lib` derive totals, order tracking timelines, user order views, and admin metrics.

## Testing

Add or update Vitest coverage before implementation:

- Auth credential success/failure.
- Order creation from cart lines.
- Order tracking lookup by order number.
- Account order merge for seeded + created orders.
- Admin CRUD add/edit/delete behavior without mutating source seed arrays.
- Checkout validation still rejects invalid contact/payment/address data.

## Browser Verification

After implementation:

- User can log in with `user@pulse.vn` / `123456`.
- Admin can log in with `admin@pulse.vn` / `admin123`.
- Checkout creates an order and clears cart.
- Tracking page finds the new order by order number.
- Account page lists the new order.
- Admin can add/edit/delete at least one entity per management route.
- Lint, test, and build pass.

## Explicit Non-Goals

- No real payment gateway integration in this iteration.
- No backend database or server API in this iteration.
- No password reset, email verification, OTP, or real user registration in this iteration.
- No claims that card payment is live without a backend provider.
