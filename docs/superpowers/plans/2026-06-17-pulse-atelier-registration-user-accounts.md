# Pulse Atelier Registration And User Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add frontend user registration and admin user-account management while removing visible seeded credential hints.

**Architecture:** Extend `auth-store` with persisted registered user accounts and CRUD methods. Login authenticates against seeded and registered accounts. UI changes are limited to login, checkout/account fallback profile usage, admin navigation, and a new admin user account page.

**Tech Stack:** Next.js 16 app router, React client components, Zustand persist, TypeScript, Vitest, ESLint.

---

## File Structure

- Modify `apps/pulse-atelier/src/data/accounts.ts`: add optional profile metadata to account type.
- Modify `apps/pulse-atelier/src/lib/auth.ts`: add email uniqueness and account id helpers.
- Modify `apps/pulse-atelier/src/stores/auth-store.ts`: registered account state, register/update/delete methods.
- Modify `apps/pulse-atelier/tests/stores.test.ts`: TDD coverage for registration and admin account CRUD.
- Modify `apps/pulse-atelier/src/app/dang-nhap/page.tsx`: login/register mode without credential hints.
- Modify `apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx`: prefill registered user profile.
- Modify `apps/pulse-atelier/src/app/tai-khoan/page.tsx`: fallback customer profile for registered users.
- Modify `apps/pulse-atelier/src/components/layout/AdminShell.tsx`: add `Tai khoan` nav.
- Create `apps/pulse-atelier/src/app/admin/tai-khoan/page.tsx`: admin user account CRUD.

## Task 1: Auth Store Registration

- [ ] Add failing store tests for register/login/update/delete registered user accounts.
- [ ] Run `npm.cmd --prefix apps/pulse-atelier run test -- tests/stores.test.ts` and verify failure.
- [ ] Extend account/auth types and auth-store methods.
- [ ] Run `npm.cmd --prefix apps/pulse-atelier run test -- tests/stores.test.ts` and verify pass.

## Task 2: Login, Account, Checkout UI

- [ ] Replace login page credential cards with login/register modes.
- [ ] Remove default email/password values from login fields.
- [ ] Use registered user phone/address for checkout prefill.
- [ ] Add account fallback profile for registered users.
- [ ] Run `npm.cmd run pulse:lint`, `npm.cmd run pulse:test`, and `npm.cmd run pulse:build`.

## Task 3: Admin User Account Management

- [ ] Add `Tai khoan` link to admin navigation.
- [ ] Create `/admin/tai-khoan` with user account table and add/edit/delete form.
- [ ] Ensure the page lists only registered normal users and never admin accounts.
- [ ] Run `npm.cmd run pulse:lint`, `npm.cmd run pulse:test`, and `npm.cmd run pulse:build`.

## Task 4: Final Verification

- [ ] Scan for visible credential hints with `rg -n "user@pulse.vn|admin@pulse.vn|admin123|123456|Tai khoan admin|Tai khoan nguoi dung" apps/pulse-atelier/src`.
- [ ] Run `npm.cmd run pulse:lint`.
- [ ] Run `npm.cmd run pulse:test`.
- [ ] Run `npm.cmd run pulse:build`.
