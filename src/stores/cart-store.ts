"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  watchId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  brand: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (watchId: string) => void;
  updateQuantity: (watchId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.watchId === item.watchId);

        if (existingItem) {
          if (existingItem.quantity < item.stock) {
            set({
              items: items.map((i) =>
                i.watchId === item.watchId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
          }
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (watchId) => {
        set({ items: get().items.filter((i) => i.watchId !== watchId) });
      },

      updateQuantity: (watchId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(watchId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.watchId === watchId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "tempus-cart",
    }
  )
);
