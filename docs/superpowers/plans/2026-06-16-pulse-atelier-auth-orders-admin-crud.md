# Pulse Atelier Auth Orders Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace demo account and checkout behavior with frontend-real user/admin login, order creation, order tracking, and add/edit/delete admin management.

**Architecture:** Keep Pulse Atelier frontend-only. Use typed Zustand stores persisted to localStorage for auth, created orders, and admin CRUD state. Pure helpers in `src/lib` handle credential validation, order creation/tracking, order merging, and admin CRUD-safe data transforms.

**Tech Stack:** Next.js 16 app router, React client components, Zustand, TypeScript, Vitest, ESLint, Tailwind CSS.

---

## File Structure

- Create `apps/pulse-atelier/src/data/accounts.ts`: seeded user/admin login accounts.
- Replace `apps/pulse-atelier/src/stores/demo-session-store.ts` with `apps/pulse-atelier/src/stores/auth-store.ts`: current logged-in account, login/logout.
- Create `apps/pulse-atelier/src/lib/auth.ts`: pure credential validation.
- Create `apps/pulse-atelier/src/stores/order-store.ts`: persisted created orders.
- Create `apps/pulse-atelier/src/lib/orders.ts`: order number generation, order creation input, order tracking helpers, seed + created order merge.
- Modify `apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx`: remove demo copy, create order, clear cart after successful order creation.
- Create `apps/pulse-atelier/src/app/theo-doi-don-hang/page.tsx`: order tracking page.
- Modify `apps/pulse-atelier/src/app/dang-nhap/page.tsx`: credential login form for user/admin.
- Modify `apps/pulse-atelier/src/app/tai-khoan/page.tsx` and account components: use auth and merged orders.
- Modify all `apps/pulse-atelier/src/app/admin/**/page.tsx`: add auth guard and CRUD UI.
- Extend `apps/pulse-atelier/src/stores/admin-demo-store.ts`: rename or keep filename but expose add/edit/delete methods for products, orders, customers, inventory movements, coupons, reviews, tickets, articles, hero banners, and settings.
- Modify tests under `apps/pulse-atelier/tests/*.test.ts` and add `auth.test.ts`, `orders.test.ts`, `admin-crud.test.ts`.

---

## Task 1: Replace Demo Session With Real Frontend Auth

**Files:**
- Create: `apps/pulse-atelier/src/data/accounts.ts`
- Create: `apps/pulse-atelier/src/lib/auth.ts`
- Create: `apps/pulse-atelier/src/stores/auth-store.ts`
- Modify: `apps/pulse-atelier/src/stores/demo-session-store.ts`
- Test: `apps/pulse-atelier/tests/auth.test.ts`
- Modify: `apps/pulse-atelier/tests/stores.test.ts`

- [ ] **Step 1: Write failing auth tests**

Create `apps/pulse-atelier/tests/auth.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { accounts } from "@/data/accounts";
import { authenticateAccount, getAccountByRole } from "@/lib/auth";

describe("auth helpers", () => {
  it("authenticates a normal user account", () => {
    const result = authenticateAccount(accounts, "user@pulse.vn", "123456");

    expect(result).toMatchObject({
      email: "user@pulse.vn",
      role: "user",
      customerId: "cust-minh-anh",
    });
  });

  it("authenticates an admin account", () => {
    const result = authenticateAccount(accounts, "admin@pulse.vn", "admin123");

    expect(result).toMatchObject({
      email: "admin@pulse.vn",
      role: "admin",
      customerId: null,
    });
  });

  it("rejects invalid credentials", () => {
    expect(authenticateAccount(accounts, "user@pulse.vn", "wrong")).toBeNull();
    expect(authenticateAccount(accounts, "missing@pulse.vn", "123456")).toBeNull();
  });

  it("can find seeded account by role", () => {
    expect(getAccountByRole(accounts, "user")?.email).toBe("user@pulse.vn");
    expect(getAccountByRole(accounts, "admin")?.email).toBe("admin@pulse.vn");
  });
});
```

- [ ] **Step 2: Run auth tests and verify RED**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/auth.test.ts
```

Expected: FAIL because `@/data/accounts` and `@/lib/auth` do not exist.

- [ ] **Step 3: Add account data and auth helpers**

Create `apps/pulse-atelier/src/data/accounts.ts`:

```ts
export type AuthRole = "guest" | "user" | "admin";

export interface Account {
  id: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "guest">;
  name: string;
  customerId: string | null;
}

export const accounts: Account[] = [
  {
    id: "acct-user-minh-anh",
    email: "user@pulse.vn",
    password: "123456",
    role: "user",
    name: "Minh Anh",
    customerId: "cust-minh-anh",
  },
  {
    id: "acct-admin-ops",
    email: "admin@pulse.vn",
    password: "admin123",
    role: "admin",
    name: "Pulse Admin",
    customerId: null,
  },
];
```

Create `apps/pulse-atelier/src/lib/auth.ts`:

```ts
import type { Account } from "@/data/accounts";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function authenticateAccount(accounts: Account[], email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  return (
    accounts.find(
      (account) => normalizeEmail(account.email) === normalizedEmail && account.password === password,
    ) ?? null
  );
}

export function getAccountByRole(accounts: Account[], role: Account["role"]) {
  return accounts.find((account) => account.role === role) ?? null;
}
```

- [ ] **Step 4: Add auth store**

Create `apps/pulse-atelier/src/stores/auth-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { accounts, type Account, type AuthRole } from "@/data/accounts";
import { authenticateAccount } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: Exclude<AuthRole, "guest">;
  name: string;
  customerId: string | null;
}

interface AuthState {
  role: AuthRole;
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; error: string };
  logout: () => void;
}

function toAuthUser(account: Account): AuthUser {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    name: account.name,
    customerId: account.customerId,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: "guest",
      user: null,
      login: (email, password) => {
        const account = authenticateAccount(accounts, email, password);

        if (!account) {
          return { ok: false, error: "Email hoac mat khau khong dung." };
        }

        const user = toAuthUser(account);
        set({ role: user.role, user });
        return { ok: true, user };
      },
      logout: () => set({ role: "guest", user: null }),
    }),
    { name: "pulse-auth" },
  ),
);
```

- [ ] **Step 5: Convert old session store into compatibility re-export**

Modify `apps/pulse-atelier/src/stores/demo-session-store.ts` to avoid breaking imports during intermediate tasks:

```ts
export { useAuthStore as useDemoSessionStore } from "./auth-store";
export type { AuthRole as DemoRole } from "@/data/accounts";
```

Later tasks must replace all imports of `demo-session-store` with `auth-store`.

- [ ] **Step 6: Update store tests for auth**

Modify `apps/pulse-atelier/tests/stores.test.ts`:

```ts
import { useAuthStore } from "@/stores/auth-store";
```

Replace the demo session test with:

```ts
it("tracks real frontend auth state", () => {
  const auth = useAuthStore.getState();

  expect(auth.role).toBe("guest");
  expect(auth.user).toBeNull();

  expect(auth.login("user@pulse.vn", "wrong")).toEqual({
    ok: false,
    error: "Email hoac mat khau khong dung.",
  });

  const userLogin = useAuthStore.getState().login("user@pulse.vn", "123456");
  expect(userLogin.ok).toBe(true);
  expect(useAuthStore.getState().role).toBe("user");
  expect(useAuthStore.getState().user?.customerId).toBe("cust-minh-anh");

  useAuthStore.getState().login("admin@pulse.vn", "admin123");
  expect(useAuthStore.getState().role).toBe("admin");

  useAuthStore.getState().logout();
  expect(useAuthStore.getState().role).toBe("guest");
});
```

In `beforeEach`, replace `useDemoSessionStore.getState().logout();` with:

```ts
useAuthStore.getState().logout();
```

- [ ] **Step 7: Run tests and verify GREEN**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/auth.test.ts tests/stores.test.ts
```

Expected: both test files pass.

- [ ] **Step 8: Commit or record git unavailable**

Run:

```powershell
git add apps/pulse-atelier/src/data/accounts.ts apps/pulse-atelier/src/lib/auth.ts apps/pulse-atelier/src/stores/auth-store.ts apps/pulse-atelier/src/stores/demo-session-store.ts apps/pulse-atelier/tests/auth.test.ts apps/pulse-atelier/tests/stores.test.ts
git commit -m "Replace demo session with frontend auth"
```

Expected: commit succeeds. If `git` is unavailable in PATH, skip commit and note it in the task summary.

---

## Task 2: Add Order Creation And Tracking Store

**Files:**
- Create: `apps/pulse-atelier/src/lib/orders.ts`
- Create: `apps/pulse-atelier/src/stores/order-store.ts`
- Modify: `apps/pulse-atelier/src/types/domain.ts`
- Test: `apps/pulse-atelier/tests/orders.test.ts`

- [ ] **Step 1: Write failing order tests**

Create `apps/pulse-atelier/tests/orders.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { orders as seedOrders } from "@/data/orders";
import {
  buildTrackingTimeline,
  createOrderFromCheckout,
  findOrderByNumber,
  mergeOrders,
} from "@/lib/orders";

describe("order helpers", () => {
  it("creates a new order from checkout data", () => {
    const order = createOrderFromCheckout({
      orderNumber: "PA-20260616-1001",
      customerId: "cust-minh-anh",
      items: [{ productId: "prod-aura-watch-pro", quantity: 1, unitPrice: 12990000 }],
      shippingAddress: "12 Nguyen Hue, Quan 1, TP HCM",
      note: "Giao sau 18h",
      paymentMethod: "cod",
      subtotal: 12990000,
      discount: 0,
      shippingFee: 45000,
      total: 13035000,
      createdAt: "2026-06-16T09:00:00.000Z",
    });

    expect(order).toMatchObject({
      orderNumber: "PA-20260616-1001",
      customerId: "cust-minh-anh",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cod",
      total: 13035000,
    });
  });

  it("merges created orders before seeded orders without duplicates", () => {
    const created = [{ ...seedOrders[0], id: "created-1", orderNumber: seedOrders[0].orderNumber }];
    const merged = mergeOrders(seedOrders, created);

    expect(merged[0].id).toBe("created-1");
    expect(merged.filter((order) => order.orderNumber === seedOrders[0].orderNumber)).toHaveLength(1);
  });

  it("finds order by number case-insensitively", () => {
    expect(findOrderByNumber(seedOrders, "pa-1001")?.orderNumber).toBe("PA-1001");
  });

  it("builds a tracking timeline for shipping status", () => {
    const timeline = buildTrackingTimeline("shipping");

    expect(timeline.map((step) => [step.status, step.state])).toEqual([
      ["pending", "done"],
      ["confirmed", "done"],
      ["packed", "done"],
      ["shipping", "current"],
      ["completed", "upcoming"],
    ]);
  });
});
```

- [ ] **Step 2: Run order tests and verify RED**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/orders.test.ts
```

Expected: FAIL because `@/lib/orders` does not exist and `Order` lacks checkout totals/payment method fields.

- [ ] **Step 3: Extend domain types**

Modify `apps/pulse-atelier/src/types/domain.ts`:

```ts
export type PaymentMethod = "cod" | "bank" | "card";
```

Extend `Order`:

```ts
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
```

- [ ] **Step 4: Implement order helpers**

Create `apps/pulse-atelier/src/lib/orders.ts`:

```ts
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "@/types/domain";

export interface CreateOrderInput {
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: string;
  note: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

export interface TrackingStep {
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
  state: "done" | "current" | "upcoming";
}

const trackingStatuses: Array<Exclude<OrderStatus, "cancelled">> = [
  "pending",
  "confirmed",
  "packed",
  "shipping",
  "completed",
];

const trackingLabels: Record<Exclude<OrderStatus, "cancelled">, string> = {
  pending: "Da tiep nhan",
  confirmed: "Da xac nhan",
  packed: "Dang dong goi",
  shipping: "Dang giao",
  completed: "Hoan tat",
};

export function createOrderFromCheckout(input: CreateOrderInput): Order {
  return {
    id: `order-${input.orderNumber.toLowerCase()}`,
    orderNumber: input.orderNumber,
    customerId: input.customerId,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: input.paymentMethod,
    items: input.items.map((item) => ({ ...item })),
    shippingAddress: input.shippingAddress,
    note: input.note,
    createdAt: input.createdAt,
    subtotal: input.subtotal,
    discount: input.discount,
    shippingFee: input.shippingFee,
    total: input.total,
  };
}

export function mergeOrders(seedOrders: Order[], createdOrders: Order[]) {
  const seen = new Set<string>();
  const merged: Order[] = [];

  for (const order of [...createdOrders, ...seedOrders]) {
    if (seen.has(order.orderNumber)) continue;
    seen.add(order.orderNumber);
    merged.push(order);
  }

  return merged.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function findOrderByNumber(orders: Order[], orderNumber: string) {
  const normalized = orderNumber.trim().toLowerCase();
  return orders.find((order) => order.orderNumber.toLowerCase() === normalized) ?? null;
}

export function buildTrackingTimeline(status: OrderStatus): TrackingStep[] {
  if (status === "cancelled") {
    return trackingStatuses.map((item, index) => ({
      status: item,
      label: trackingLabels[item],
      state: index === 0 ? "done" : "upcoming",
    }));
  }

  const currentIndex = trackingStatuses.indexOf(status);

  return trackingStatuses.map((item, index) => ({
    status: item,
    label: trackingLabels[item],
    state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
  }));
}

export function generateOrderNumber(date = new Date(), random = Math.random) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + random() * 9000);
  return `PA-${stamp}-${suffix}`;
}
```

- [ ] **Step 5: Add order store**

Create `apps/pulse-atelier/src/stores/order-store.ts`:

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/domain";

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (orderId, patch) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)),
        })),
      deleteOrder: (orderId) =>
        set((state) => ({ orders: state.orders.filter((order) => order.id !== orderId) })),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: "pulse-orders" },
  ),
);
```

- [ ] **Step 6: Run order tests and full tests**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/orders.test.ts
npm.cmd run pulse:test
```

Expected: all tests pass.

- [ ] **Step 7: Commit or record git unavailable**

Run:

```powershell
git add apps/pulse-atelier/src/lib/orders.ts apps/pulse-atelier/src/stores/order-store.ts apps/pulse-atelier/src/types/domain.ts apps/pulse-atelier/tests/orders.test.ts
git commit -m "Add frontend order creation and tracking helpers"
```

Expected: commit succeeds, or skip if `git` is unavailable.

---

## Task 3: Replace Demo Login And Checkout UI

**Files:**
- Modify: `apps/pulse-atelier/src/app/dang-nhap/page.tsx`
- Modify: `apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx`
- Modify: `apps/pulse-atelier/src/app/thanh-toan/page.tsx`
- Modify: `apps/pulse-atelier/src/components/layout/Header.tsx`
- Test: `apps/pulse-atelier/tests/checkout.test.ts`

- [ ] **Step 1: Update checkout tests for real payment labels**

Modify `apps/pulse-atelier/tests/checkout.test.ts` valid input test to keep `paymentMethod: "cod"` and expect validation to pass. Add:

```ts
it("rejects disabled card payment until a provider is connected", () => {
  const input: CheckoutInput = {
    name: "Minh Anh",
    email: "minh.anh@example.com",
    phone: "0901002003",
    address: "12 Nguyen Hue, Quan 1, TP HCM",
    paymentMethod: "card",
    note: "",
    couponCode: "",
  };

  expect(validateCheckout(input)).toEqual({
    ok: false,
    errors: {
      paymentMethod: "Card payment is not available until a payment provider is connected.",
    },
  });
});
```

- [ ] **Step 2: Run checkout tests and verify RED**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/checkout.test.ts
```

Expected: FAIL because `card` currently validates as accepted.

- [ ] **Step 3: Update checkout validation**

Modify `apps/pulse-atelier/src/lib/checkout.ts`:

```ts
const VALID_PAYMENT_METHODS = new Set(["cod", "bank"]);
```

In `validateCheckout`, change payment error logic:

```ts
if (input.paymentMethod === "card") {
  errors.paymentMethod = "Card payment is not available until a payment provider is connected.";
} else if (!VALID_PAYMENT_METHODS.has(input.paymentMethod)) {
  errors.paymentMethod = "Payment method must be cod or bank.";
}
```

- [ ] **Step 4: Replace login page with form**

Modify `apps/pulse-atelier/src/app/dang-nhap/page.tsx` as a client component using `useAuthStore.login`. It must render:

- Email input.
- Password input.
- Submit button "Dang nhap".
- Credential hints:
  - User: `user@pulse.vn` / `123456`
  - Admin: `admin@pulse.vn` / `admin123`
- Logout button only when already logged in.

On submit:

```ts
const result = login(email, password);
if (!result.ok) {
  setError(result.error);
  return;
}
router.push(result.user.role === "admin" ? "/admin" : "/tai-khoan");
```

- [ ] **Step 5: Replace checkout form submit behavior**

Modify `apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx`:

- Replace `useDemoSessionStore` with `useAuthStore`.
- Import `useOrderStore`, `createOrderFromCheckout`, `generateOrderNumber`.
- Remove every visible string containing "demo".
- Payment labels:

```ts
const paymentMethods = [
  { value: "cod", label: "Thanh toan khi nhan hang", icon: WalletCards, disabled: false },
  { value: "bank", label: "Chuyen khoan ngan hang", icon: Landmark, disabled: false },
  { value: "card", label: "The ngan hang", icon: CreditCard, disabled: true },
];
```

On valid submit:

```ts
const order = createOrderFromCheckout({
  orderNumber: generateOrderNumber(),
  customerId: user?.customerId ?? "guest-checkout",
  items: orderItems,
  shippingAddress: input.address,
  note: input.note,
  paymentMethod: payload.paymentMethod as "cod" | "bank",
  subtotal: totals.subtotal,
  discount: totals.discount,
  shippingFee: totals.shippingFee,
  total: totals.total,
  createdAt: new Date().toISOString(),
});
addOrder(order);
clearCart();
setConfirmed(true);
setConfirmationNumber(order.orderNumber);
```

Confirmation must include links:

```tsx
<Link href={`/theo-doi-don-hang?order=${confirmationNumber}`}>Theo doi don hang</Link>
<Link href="/tai-khoan">Xem tai khoan</Link>
```

- [ ] **Step 6: Update checkout page copy**

Modify `apps/pulse-atelier/src/app/thanh-toan/page.tsx`:

- Badge: `Checkout`.
- Copy: `Hoan tat thong tin giao hang va chon phuong thuc thanh toan phu hop.`
- No "demo" text.

- [ ] **Step 7: Update header auth labels**

Modify `apps/pulse-atelier/src/components/layout/Header.tsx`:

- Import `useAuthStore`.
- Show account icon title as logged-in user name when user exists.
- Admin icon remains visible but `/admin` will guard access.
- Keep cart/wishlist/compare counters unchanged.

- [ ] **Step 8: Run checks**

Run:

```powershell
npm.cmd run pulse:test
npm.cmd run pulse:lint
npm.cmd run pulse:build
```

Expected: all pass.

- [ ] **Step 9: Remove generated app build output**

Run:

```powershell
$target = Resolve-Path apps\pulse-atelier\.next -ErrorAction SilentlyContinue; if ($target) { $root = (Resolve-Path apps\pulse-atelier).Path; if ($target.Path.StartsWith($root)) { Remove-Item -LiteralPath $target.Path -Recurse -Force } else { throw "Refusing to remove $($target.Path)" } }
```

Expected: `apps/pulse-atelier/.next` removed after build.

---

## Task 4: Add Order Tracking And User Account Order Merge

**Files:**
- Create: `apps/pulse-atelier/src/app/theo-doi-don-hang/page.tsx`
- Modify: `apps/pulse-atelier/src/lib/account.ts`
- Modify: `apps/pulse-atelier/src/app/tai-khoan/page.tsx`
- Modify: `apps/pulse-atelier/src/components/account/OrderHistory.tsx`
- Test: `apps/pulse-atelier/tests/account.test.ts`

- [ ] **Step 1: Update account tests**

Modify `apps/pulse-atelier/tests/account.test.ts` to pass merged orders:

```ts
const createdOrder = {
  ...orders[0],
  id: "created-pa-20260616-1001",
  orderNumber: "PA-20260616-1001",
  customerId: "cust-minh-anh",
  createdAt: "2026-06-16T09:00:00.000Z",
};
```

In the "builds profile" test, pass `orders: [createdOrder, ...orders]` and expect:

```ts
expect(snapshot.orders[0].orderNumber).toBe("PA-20260616-1001");
```

- [ ] **Step 2: Run account tests**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/account.test.ts
```

Expected: PASS if `buildAccountSnapshot` already sorts by date; FAIL if it filters created orders incorrectly.

- [ ] **Step 3: Implement tracking page**

Create `apps/pulse-atelier/src/app/theo-doi-don-hang/page.tsx` as a client component:

- Read `searchParams` via `useSearchParams`.
- Merge seeded orders and `useOrderStore` orders using `mergeOrders`.
- Use `findOrderByNumber`.
- Render search input and button.
- If an order is found, render:
  - order number
  - status pill
  - timeline from `buildTrackingTimeline`
  - order items
  - total
  - shipping address
- If no order is found and a query exists, render `EmptyState` with "Khong tim thay don hang".

The submit handler must update URL:

```ts
router.push(`/theo-doi-don-hang?order=${encodeURIComponent(query.trim())}`);
```

- [ ] **Step 4: Update account page auth and order source**

Modify `apps/pulse-atelier/src/app/tai-khoan/page.tsx`:

- Replace `useDemoSessionStore` with `useAuthStore`.
- Import `useOrderStore` and `mergeOrders`.
- Use `auth.user?.customerId`.
- Pass merged orders into `buildAccountSnapshot`.
- Replace all "demo" visible copy with normal account copy.

- [ ] **Step 5: Add tracking links to order history**

Modify `apps/pulse-atelier/src/components/account/OrderHistory.tsx`:

Add a link per order:

```tsx
<Link href={`/theo-doi-don-hang?order=${order.orderNumber}`} className="text-sm font-semibold text-pulse hover:text-frost">
  Theo doi
</Link>
```

- [ ] **Step 6: Run checks**

Run:

```powershell
npm.cmd run pulse:test
npm.cmd run pulse:lint
npm.cmd run pulse:build
```

Expected: all pass.

---

## Task 5: Add Admin Store CRUD

**Files:**
- Modify: `apps/pulse-atelier/src/stores/admin-demo-store.ts`
- Modify: `apps/pulse-atelier/src/data/admin.ts`
- Modify: `apps/pulse-atelier/src/data/content.ts`
- Test: `apps/pulse-atelier/tests/admin-crud.test.ts`
- Modify: `apps/pulse-atelier/tests/stores.test.ts`

- [ ] **Step 1: Write failing CRUD tests**

Create `apps/pulse-atelier/tests/admin-crud.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { useAdminDemoStore } from "@/stores/admin-demo-store";

describe("admin CRUD store", () => {
  beforeEach(() => {
    useAdminDemoStore.getState().reset();
  });

  it("adds, edits, and deletes a product", () => {
    const store = useAdminDemoStore.getState();

    store.addProduct({
      sku: "PA-NEW-001",
      name: "New Device",
      categoryId: "accessory",
      price: 990000,
      stock: 5,
      status: "active",
    });

    const created = useAdminDemoStore.getState().products.find((product) => product.sku === "PA-NEW-001");
    expect(created?.name).toBe("New Device");

    useAdminDemoStore.getState().updateProduct(created!.id, { name: "Updated Device", stock: 9 });
    expect(useAdminDemoStore.getState().products.find((product) => product.id === created!.id)?.name).toBe("Updated Device");

    useAdminDemoStore.getState().deleteProduct(created!.id);
    expect(useAdminDemoStore.getState().products.find((product) => product.id === created!.id)).toBeUndefined();
  });

  it("adds, edits, and deletes a customer", () => {
    const store = useAdminDemoStore.getState();

    store.addCustomer({
      name: "Test Customer",
      email: "test@example.com",
      phone: "0900000000",
      segment: "New",
      address: "1 Test Street",
    });

    const created = useAdminDemoStore.getState().customers.find((customer) => customer.email === "test@example.com");
    expect(created?.name).toBe("Test Customer");

    useAdminDemoStore.getState().updateCustomer(created!.id, { segment: "VIP" });
    expect(useAdminDemoStore.getState().customers.find((customer) => customer.id === created!.id)?.segment).toBe("VIP");

    useAdminDemoStore.getState().deleteCustomer(created!.id);
    expect(useAdminDemoStore.getState().customers.find((customer) => customer.id === created!.id)).toBeUndefined();
  });

  it("adds, edits, and deletes a coupon", () => {
    const store = useAdminDemoStore.getState();

    store.addCoupon({
      code: "NEW10",
      type: "percent",
      value: 10,
      usageLimit: 50,
      active: true,
    });

    const created = useAdminDemoStore.getState().coupons.find((coupon) => coupon.code === "NEW10");
    expect(created?.value).toBe(10);

    useAdminDemoStore.getState().updateCoupon(created!.id, { value: 12 });
    expect(useAdminDemoStore.getState().coupons.find((coupon) => coupon.id === created!.id)?.value).toBe(12);

    useAdminDemoStore.getState().deleteCoupon(created!.id);
    expect(useAdminDemoStore.getState().coupons.find((coupon) => coupon.id === created!.id)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run CRUD tests and verify RED**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/admin-crud.test.ts
```

Expected: FAIL because CRUD methods and `customers` state do not exist in admin store.

- [ ] **Step 3: Extend admin store state**

Modify `apps/pulse-atelier/src/stores/admin-demo-store.ts`:

- Import `customers`, `articles`, and `heroBanners`.
- Add state arrays:

```ts
customers: Customer[];
inventoryMovements: InventoryMovement[];
articles: Article[];
heroBanners: HeroBanner[];
settings: StoreSettings;
```

- Add methods:

```ts
addProduct(input: ProductCreateInput): void;
updateProduct(productId: string, patch: Partial<Product>): void;
deleteProduct(productId: string): void;
addCustomer(input: CustomerCreateInput): void;
updateCustomer(customerId: string, patch: Partial<Customer>): void;
deleteCustomer(customerId: string): void;
addOrder(order: Order): void;
updateOrder(orderId: string, patch: Partial<Order>): void;
deleteOrder(orderId: string): void;
addCoupon(input: CouponCreateInput): void;
updateCoupon(couponId: string, patch: Partial<Coupon>): void;
deleteCoupon(couponId: string): void;
addReview(input: ReviewCreateInput): void;
updateReview(reviewId: string, patch: Partial<Review>): void;
deleteReview(reviewId: string): void;
addTicket(input: TicketCreateInput): void;
updateTicket(ticketId: string, patch: Partial<SupportTicket>): void;
deleteTicket(ticketId: string): void;
addInventoryMovement(input: InventoryMovementCreateInput): void;
updateInventoryMovement(movementId: string, patch: Partial<InventoryMovement>): void;
deleteInventoryMovement(movementId: string): void;
addArticle(input: ArticleCreateInput): void;
updateArticle(articleId: string, patch: Partial<Article>): void;
deleteArticle(articleId: string): void;
addHeroBanner(input: HeroBannerCreateInput): void;
updateHeroBanner(heroId: string, patch: Partial<HeroBanner>): void;
deleteHeroBanner(heroId: string): void;
updateSettings(patch: Partial<StoreSettings>): void;
```

Use deterministic ids:

```ts
function nextId(prefix: string, existingLength: number) {
  return `${prefix}-${String(existingLength + 1).padStart(3, "0")}`;
}
```

- [ ] **Step 4: Persist admin store**

Wrap `useAdminDemoStore` with Zustand `persist`:

```ts
export const useAdminDemoStore = create<AdminDemoState>()(
  persist(
    (set) => ({
      ...initialState(),
      ...
    }),
    { name: "pulse-admin-state" },
  ),
);
```

- [ ] **Step 5: Run CRUD tests and full store tests**

Run:

```powershell
npm.cmd --prefix apps/pulse-atelier run test -- tests/admin-crud.test.ts tests/stores.test.ts
```

Expected: all pass.

---

## Task 6: Add Admin Auth Guard And CRUD UI For Products, Orders, Customers

**Files:**
- Modify: `apps/pulse-atelier/src/components/layout/AdminShell.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/san-pham/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/don-hang/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/khach-hang/page.tsx`

- [ ] **Step 1: Add admin guard to AdminShell**

Modify `apps/pulse-atelier/src/components/layout/AdminShell.tsx`:

- Make it a client component.
- Import `useAuthStore`, `EmptyState`, and `Link`.
- If `role !== "admin"`, render:

```tsx
<div className="min-h-screen bg-obsidian px-4 py-10 text-frost">
  <EmptyState
    title="Can dang nhap admin"
    description="Dang nhap bang tai khoan admin de quan tri cua hang."
    action={<Link href="/dang-nhap" className="...">Dang nhap admin</Link>}
  />
</div>
```

Use the existing primary link classes from customer pages for the action.

- [ ] **Step 2: Products page CRUD**

Modify `apps/pulse-atelier/src/app/admin/san-pham/page.tsx`:

- Use `addProduct`, `updateProduct`, `deleteProduct`.
- Add form fields: SKU, name, category, price, stock, status.
- Submit button text:
  - "Them san pham" when no selected product is in edit mode.
  - "Luu san pham" when editing selected product.
- Add buttons:
  - "Sua" in table row to load selected product into form.
  - "Xoa" in action panel to delete selected product.
- On add, call:

```ts
addProduct({
  sku,
  name,
  categoryId,
  price: Number(price),
  stock: Number(stock),
  status,
});
```

- On edit, call:

```ts
updateProduct(selectedProduct.id, {
  sku,
  name,
  categoryId,
  price: Number(price),
  stock: Number(stock),
  status,
});
```

- [ ] **Step 3: Orders page CRUD**

Modify `apps/pulse-atelier/src/app/admin/don-hang/page.tsx`:

- Use `addOrder`, `updateOrder`, `deleteOrder`.
- Keep status buttons.
- Add manual order form with customer, product, quantity, address, payment method.
- Add "Xoa don" button in detail panel.
- Delete removes order from admin state.

- [ ] **Step 4: Customers page CRUD**

Modify `apps/pulse-atelier/src/app/admin/khach-hang/page.tsx`:

- Convert to client component.
- Use `customers` from admin store instead of seed data.
- Add add/edit form for name, email, phone, segment, address.
- Add row buttons "Sua" and "Xoa".
- On delete, call `deleteCustomer(customer.id)`.

- [ ] **Step 5: Run admin UI checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all pass.

---

## Task 7: Add CRUD UI For Remaining Admin Sections

**Files:**
- Modify: `apps/pulse-atelier/src/app/admin/kho/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/ma-giam-gia/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/danh-gia/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/ho-tro/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/noi-dung/page.tsx`
- Modify: `apps/pulse-atelier/src/app/admin/cai-dat/page.tsx`

- [ ] **Step 1: Inventory CRUD UI**

Modify `apps/pulse-atelier/src/app/admin/kho/page.tsx`:

- Use `inventoryMovements` from admin store.
- Add movement form with product, type, quantity, reason.
- Add edit/delete buttons per movement.
- On add, call `addInventoryMovement({ productId, type, quantity: Number(quantity), reason })`.

- [ ] **Step 2: Coupon CRUD UI**

Modify `apps/pulse-atelier/src/app/admin/ma-giam-gia/page.tsx`:

- Keep toggle.
- Add form with code, type, value, usageLimit, active.
- Add edit/delete row buttons.
- On add, call `addCoupon({ code, type, value: Number(value), usageLimit: Number(usageLimit), active })`.

- [ ] **Step 3: Reviews CRUD UI**

Modify `apps/pulse-atelier/src/app/admin/danh-gia/page.tsx`:

- Add review form with product, customer, rating, content, status.
- Add edit/delete buttons.
- Keep approve/hide actions.

- [ ] **Step 4: Support CRUD UI**

Modify `apps/pulse-atelier/src/app/admin/ho-tro/page.tsx`:

- Add ticket form with customer, product optional, subject, priority, assignedTo, status.
- Add edit/delete buttons.
- Keep status quick actions.

- [ ] **Step 5: Content CRUD UI**

Modify `apps/pulse-atelier/src/app/admin/noi-dung/page.tsx`:

- Convert to client component.
- Use `heroBanners` and `articles` from admin store.
- Add hero banner form: title, subtitle, ctaLabel, ctaHref, productId.
- Add article form: title, slug, excerpt, category, published.
- Add edit/delete buttons in both tables.

- [ ] **Step 6: Settings edit/reset UI**

Modify `apps/pulse-atelier/src/app/admin/cai-dat/page.tsx`:

- Use settings from admin store.
- `Luu cai dat` calls `updateSettings`.
- Add `Dat lai mac dinh` button that calls `reset()` and reloads local form state from defaults.

- [ ] **Step 7: Run checks**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:build
npm.cmd run pulse:test
```

Expected: all pass.

---

## Task 8: Remove Demo Wording And Final Verification

**Files:**
- Modify: all files under `apps/pulse-atelier/src` that still contain visible "demo" copy.
- Modify: tests if they assert old demo copy.

- [ ] **Step 1: Scan for demo wording**

Run:

```powershell
rg -n "demo|Demo|PA-DEMO|useDemoSessionStore|loginAsCustomer|loginAsAdmin" apps/pulse-atelier/src apps/pulse-atelier/tests
```

Expected: remaining matches are only allowed in internal compatibility exports or deleted entirely. Visible UI copy must not contain "demo".

- [ ] **Step 2: Remove compatibility store imports**

Replace all app imports:

```ts
import { useDemoSessionStore } from "@/stores/demo-session-store";
```

with:

```ts
import { useAuthStore } from "@/stores/auth-store";
```

If no imports remain, delete `apps/pulse-atelier/src/stores/demo-session-store.ts`.

- [ ] **Step 3: Full verification**

Run:

```powershell
npm.cmd run pulse:lint
npm.cmd run pulse:test
npm.cmd run pulse:build
```

Expected:

- lint exits 0.
- test exits 0 with all test files passing.
- build exits 0 and includes `/theo-doi-don-hang`.

- [ ] **Step 4: Remove generated build output**

Run:

```powershell
$target = Resolve-Path apps\pulse-atelier\.next -ErrorAction SilentlyContinue; if ($target) { $root = (Resolve-Path apps\pulse-atelier).Path; if ($target.Path.StartsWith($root)) { Remove-Item -LiteralPath $target.Path -Recurse -Force } else { throw "Refusing to remove $($target.Path)" } }
```

Expected: `apps/pulse-atelier/.next` is removed.

- [ ] **Step 5: Optional browser smoke test**

Run the app:

```powershell
npm.cmd run pulse:dev
```

Verify in browser:

- User login works with `user@pulse.vn` / `123456`.
- Admin login works with `admin@pulse.vn` / `admin123`.
- Checkout creates an order and opens tracking.
- `/theo-doi-don-hang` finds the new order.
- `/tai-khoan` lists the order.
- Admin products, orders, customers, coupons, reviews, support, content, and settings expose add/edit/delete controls.

Expected: all smoke paths work. Stop the dev server after testing.

- [ ] **Step 6: Commit or record git unavailable**

Run:

```powershell
git add apps/pulse-atelier docs/superpowers/specs/2026-06-16-pulse-atelier-auth-orders-admin-crud-design.md docs/superpowers/plans/2026-06-16-pulse-atelier-auth-orders-admin-crud.md
git commit -m "Replace demo flows with auth orders tracking and admin CRUD"
```

Expected: commit succeeds, or skip if `git` is unavailable in PATH.

---

## Self-Review Notes

- Spec coverage:
  - Auth user/admin login: Task 1 and Task 3.
  - Remove demo checkout copy and create real frontend orders: Task 2 and Task 3.
  - Order tracking: Task 4.
  - Customer account order history: Task 4.
  - Admin add/edit/delete: Task 5, Task 6, Task 7.
  - Final removal of demo wording: Task 8.
- Type consistency:
  - `AuthRole`, `Account`, and `AuthUser` are defined before UI tasks use them.
  - `PaymentMethod` and order total fields are added before checkout/order store tasks use them.
  - Admin CRUD method names are defined in Task 5 and reused by Tasks 6 and 7.
- Scope:
  - No backend payment gateway, database, registration, password reset, OTP, or real card processing is included.
