"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { accounts, type Account, type AuthRole } from "@/data/accounts";
import { accountEmailExists, createAccountId, createCustomerId, normalizeEmail } from "@/lib/auth";
import { loginAction, registerAction } from "@/lib/auth-actions";
import { useAdminStore } from "@/stores/admin-store";

export interface AuthUser {
  id: string;
  email: string;
  role: Exclude<AuthRole, "guest">;
  name: string;
  customerId: string | null;
  phone: string;
  address: string;
  createdAt: string | null;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface RegisteredAccountPatch {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
}

interface AuthState {
  role: AuthRole;
  user: AuthUser | null;
  registeredAccounts: Account[];
  login: (email: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  register: (input: RegisterInput) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  createRegisteredAccount: (input: RegisterInput) => { ok: true; account: Account } | { ok: false; error: string };
  updateRegisteredAccount: (accountId: string, patch: RegisteredAccountPatch) => void;
  deleteRegisteredAccount: (accountId: string) => void;
  resetRegisteredAccounts: () => void;
  logout: () => void;
}

function toAuthUser(account: Account): AuthUser {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    name: account.name,
    customerId: account.customerId,
    phone: account.phone ?? "",
    address: account.address ?? "",
    createdAt: account.createdAt ?? null,
  };
}

function validateRegistration(input: RegisterInput, existingAccounts: Account[]) {
  if (!input.name.trim()) {
    return "Ten la bat buoc.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return "Email khong hop le.";
  }

  if (accountEmailExists(existingAccounts, input.email)) {
    return "Email nay da duoc su dung.";
  }

  if (input.password.length < 6) {
    return "Mat khau phai co it nhat 6 ky tu.";
  }

  return null;
}

function createRegisteredAccount(input: RegisterInput): Account {
  const normalizedEmail = normalizeEmail(input.email);

  return {
    id: createAccountId(normalizedEmail),
    email: normalizedEmail,
    password: input.password,
    role: "user",
    name: input.name.trim(),
    customerId: createCustomerId(normalizedEmail),
    phone: input.phone.trim(),
    address: input.address.trim(),
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      role: "guest",
      user: null,
      registeredAccounts: [],
      login: async (email, password) => {
        const result = await loginAction(email, password);
        if (!result.ok) {
          return result;
        }
        set({ role: result.user.role, user: result.user });
        return result;
      },
      register: async (input) => {
        const result = await registerAction(input);
        if (!result.ok) {
          return result;
        }
        const account = {
          id: result.user.id,
          email: result.user.email,
          password: input.password,
          role: result.user.role,
          name: result.user.name,
          customerId: result.user.customerId,
          phone: result.user.phone,
          address: result.user.address,
          createdAt: result.user.createdAt || new Date().toISOString(),
        };
        set((state) => ({
          role: result.user.role,
          user: result.user,
          registeredAccounts: [account, ...state.registeredAccounts],
        }));

        if (result.user.customerId) {
          const customerObj = {
            id: result.user.customerId,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            segment: "New" as const,
            address: result.user.address,
            lifetimeSpend: 0,
            wishlistProductIds: [],
          };
          useAdminStore.setState((state) => ({
            customers: [customerObj, ...state.customers],
          }));
        }

        return result;
      },
      createRegisteredAccount: (input) => {
        const existingAccounts = [...accounts, ...get().registeredAccounts];
        const error = validateRegistration(input, existingAccounts);

        if (error) {
          return { ok: false, error };
        }

        const account = createRegisteredAccount(input);

        set((state) => ({
          registeredAccounts: [account, ...state.registeredAccounts],
        }));

        if (account.customerId) {
          const customerObj = {
            id: account.customerId,
            name: account.name,
            email: account.email,
            phone: account.phone ?? "",
            segment: "New" as const,
            address: account.address ?? "",
            lifetimeSpend: 0,
            wishlistProductIds: [],
          };
          useAdminStore.setState((state) => ({
            customers: [customerObj, ...state.customers],
          }));
        }

        return { ok: true, account };
      },
      updateRegisteredAccount: (accountId, patch) => {
        const accountToUpdate = get().registeredAccounts.find((account) => account.id === accountId);
        if (accountToUpdate && accountToUpdate.customerId) {
          const customerId = accountToUpdate.customerId;
          useAdminStore.setState((state) => ({
            customers: state.customers.map((cust) =>
              cust.id === customerId
                ? {
                    ...cust,
                    name: patch.name?.trim() || cust.name,
                    email: patch.email ? normalizeEmail(patch.email) : cust.email,
                    phone: patch.phone !== undefined ? patch.phone.trim() : cust.phone,
                    address: patch.address !== undefined ? patch.address.trim() : cust.address,
                  }
                : cust,
            ),
          }));
        }

        set((state) => {
          const nextAccounts = state.registeredAccounts.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  ...patch,
                  email: patch.email ? normalizeEmail(patch.email) : account.email,
                  name: patch.name?.trim() || account.name,
                  phone: patch.phone !== undefined ? patch.phone.trim() : account.phone,
                  address: patch.address !== undefined ? patch.address.trim() : account.address,
                  password: patch.password || account.password,
                }
              : account,
          );
          const updatedCurrent = state.user
            ? nextAccounts.find((account) => account.id === state.user?.id) ?? null
            : null;

          return {
            registeredAccounts: nextAccounts,
            user: updatedCurrent ? toAuthUser(updatedCurrent) : state.user,
          };
        });
      },
      deleteRegisteredAccount: (accountId) => {
        const accountToDelete = get().registeredAccounts.find((account) => account.id === accountId);
        if (accountToDelete && accountToDelete.customerId) {
          const customerId = accountToDelete.customerId;
          useAdminStore.setState((state) => ({
            customers: state.customers.filter((cust) => cust.id !== customerId),
          }));
        }
        set((state) => ({
          registeredAccounts: state.registeredAccounts.filter((account) => account.id !== accountId),
          role: state.user?.id === accountId ? "guest" : state.role,
          user: state.user?.id === accountId ? null : state.user,
        }));
      },
      resetRegisteredAccounts: () => set({ registeredAccounts: [] }),
      logout: () => set({ role: "guest", user: null }),
    }),
    { name: "pulse-auth" },
  ),
);
