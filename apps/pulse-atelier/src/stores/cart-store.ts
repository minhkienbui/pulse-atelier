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

function sanitizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(9, Math.max(1, Math.floor(quantity)));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.productId === productId);
          const sanitizedQuantity = sanitizeQuantity(quantity);

          if (!existing) {
            return { items: [...state.items, { productId, quantity: sanitizedQuantity }] };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.productId === productId
                ? { ...cartItem, quantity: sanitizeQuantity(cartItem.quantity + sanitizedQuantity) }
                : cartItem,
            ),
          };
        }),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: sanitizeQuantity(quantity) } : item,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "pulse-cart" },
  ),
);
