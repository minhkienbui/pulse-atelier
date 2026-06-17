# Database Authentication and Hiding Admin Navigation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement database-backed sign-up and login using Neon DB and Prisma ORM, hide all admin links from non-admin users, and restrict admin dashboard entry only to authenticated admin accounts.

**Architecture:** Use Prisma to query `Account` table. Implement server actions for backend database validation. Adapt Zustand store to run auth functions asynchronously via server actions. Conditionally render navigation links based on user role.

**Tech Stack:** Next.js Server Actions, Prisma Client, Zustand Store, Neon DB.

---

## Proposed Changes

### Database Auth

#### [MODIFY] [schema.prisma](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/schema.prisma)
* Add `Account` model.
* Link `Customer` with `Account` model.

#### [MODIFY] [seed.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/seed.ts)
* Seed default accounts into Neon DB.

#### [NEW] [auth-actions.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/auth-actions.ts)
* Create `loginAction` and `registerAction` Server Actions.

#### [MODIFY] [auth-store.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/stores/auth-store.ts)
* Connect Zustand store to call the new Server Actions asynchronously.

---

### Page & Layout Updates

#### [MODIFY] [page.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/app/dang-nhap/page.tsx)
* Make authentication submit handlers async.

#### [MODIFY] [Header.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/components/layout/Header.tsx)
* Only show Admin navigation link and button if user role is `admin`.

#### [MODIFY] [Footer.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/components/layout/Footer.tsx)
* Convert Footer to client component and only show Admin link if user role is `admin`.

---

## Implementation Tasks

### Task 1: Update Prisma Schema & DB Push

**Files:**
* Modify: [schema.prisma](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/schema.prisma)

- [ ] **Step 1: Add Account model to schema.prisma**
  Open `schema.prisma` and add `Account` model and link to `Customer`:
  ```prisma
  // In Customer model:
  // account Account?

  // In Account model:
  model Account {
    id         String    @id @default(uuid())
    email      String    @unique
    password   String
    role       String    @default("user") // "user" | "admin"
    name       String
    customerId String?   @unique
    customer   Customer? @relation(fields: [customerId], references: [id])
    phone      String?
    address    String?
    createdAt  DateTime  @default(now())
  }
  ```
- [ ] **Step 2: Push schema changes to Neon DB**
  Run:
  ```powershell
  npx.cmd prisma db push
  ```
  Expected: "Your database is now in sync with your Prisma schema".

---

### Task 2: Update Database Seed Script

**Files:**
* Modify: [seed.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/prisma/seed.ts)

- [ ] **Step 1: Seed default accounts**
  Update `seed.ts` to clear and write default accounts:
  ```typescript
  console.log("Seeding accounts...");
  await prisma.account.deleteMany();
  for (const acct of accounts) {
    await prisma.account.create({
      data: {
        id: acct.id,
        email: acct.email,
        password: acct.password,
        role: acct.role,
        name: acct.name,
        customerId: acct.customerId,
        phone: acct.phone || "",
        address: acct.address || "",
        createdAt: acct.createdAt ? new Date(acct.createdAt) : new Date(),
      },
    });
  }
  ```
- [ ] **Step 2: Run seeding**
  Run:
  ```powershell
  npx.cmd prisma db seed
  ```
  Expected: "Database seeded successfully!".

---

### Task 3: Create Server Actions for Auth

**Files:**
* Create: [auth-actions.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/auth-actions.ts)

- [ ] **Step 1: Write auth-actions.ts**
  Create `src/lib/auth-actions.ts` containing `"use server"` and functions:
  * `loginAction(email, password)`
  * `registerAction(input)`
  ```typescript
  "use server";

  import { db } from "./db";
  import type { Account } from "@/data/accounts";

  export async function loginAction(email: string, password: string) {
    try {
      const account = await db.account.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!account || account.password !== password) {
        return { ok: false as const, error: "Email hoặc mật khẩu không đúng." };
      }

      return {
        ok: true as const,
        user: {
          id: account.id,
          email: account.email,
          role: account.role as "user" | "admin",
          name: account.name,
          customerId: account.customerId,
          phone: account.phone || "",
          address: account.address || "",
          createdAt: account.createdAt.toISOString(),
        },
      };
    } catch (err) {
      return { ok: false as const, error: "Đã xảy ra lỗi khi đăng nhập." };
    }
  }

  export async function registerAction(input: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) {
    try {
      const emailNormalized = input.email.trim().toLowerCase();
      const existing = await db.account.findUnique({
        where: { email: emailNormalized },
      });

      if (existing) {
        return { ok: false as const, error: "Email này đã được sử dụng." };
      }

      // Create linked Customer record
      const customer = await db.customer.create({
        data: {
          name: input.name,
          email: emailNormalized,
          phone: input.phone,
          address: input.address,
          segment: "New",
          lifetimeSpend: 0.0,
        },
      });

      // Create Account linked to Customer
      const account = await db.account.create({
        data: {
          email: emailNormalized,
          password: input.password,
          name: input.name,
          role: "user",
          customerId: customer.id,
          phone: input.phone,
          address: input.address,
        },
      });

      return {
        ok: true as const,
        user: {
          id: account.id,
          email: account.email,
          role: account.role as "user" | "admin",
          name: account.name,
          customerId: account.customerId,
          phone: account.phone || "",
          address: account.address || "",
          createdAt: account.createdAt.toISOString(),
        },
      };
    } catch (err) {
      return { ok: false as const, error: "Đã xảy ra lỗi khi đăng ký tài khoản." };
    }
  }
  ```

---

### Task 4: Update Zustand Auth Store

**Files:**
* Modify: [auth-store.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/stores/auth-store.ts)

- [ ] **Step 1: Update store actions to call Server Actions**
  Import server actions:
  ```typescript
  import { loginAction, registerAction } from "@/lib/auth-actions";
  ```
  Update `login` and `register` actions in Zustand store:
  ```typescript
  login: async (email, password) => {
    const res = await loginAction(email, password);
    if (!res.ok) return res;
    set({ role: res.user.role, user: res.user });
    return res;
  },
  register: async (input) => {
    const res = await registerAction(input);
    if (!res.ok) return res;
    set({ role: res.user.role, user: res.user });
    return res;
  },
  ```

---

### Task 5: Update LoginPage to Support Async Auth

**Files:**
* Modify: [page.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/app/dang-nhap/page.tsx)

- [ ] **Step 1: Convert submit handlers to async**
  Mark `handleLogin` and `handleRegister` as `async` and use `await` when calling `login(...)` and `register(...)`.

---

### Task 6: Hide Admin links in Header & Footer

**Files:**
* Modify: [Header.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/components/layout/Header.tsx)
* Modify: [Footer.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/components/layout/Footer.tsx)

- [ ] **Step 1: Update Header navigation link**
  Remove static `Admin` link from `navLinks` list, and render it conditionally in navigation if `user?.role === "admin"`.
- [ ] **Step 2: Update Header Admin icon button**
  Render `BarChart3` icon link only if `user?.role === "admin"`.
- [ ] **Step 3: Update Footer links**
  Add `"use client"` and use `useAuthStore` to hide the static `Admin` link from the footer lists if the current user role is not `admin`.

---

## Verification Plan

### Automated Tests
- Run `npm.cmd run build` to verify Next.js compilations.

### Manual Verification
- Start the server: `npm.cmd run dev`.
- Visit `http://localhost:3100`. Verify "Admin" link/icon is NOT visible in the Header or Footer.
- Go to `/dang-nhap` and log in as Customer (`user@pulse.vn` / `123456`). Verify it logs in successfully, redirects to `/tai-khoan`, and "Admin" navigation is still hidden.
- Log out, then log in as Admin (`admin@pulse.vn` / `admin123`). Verify it logs in successfully, redirects to `/admin`, and "Admin" link & icon are visible in the Header.
