"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  watchId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  brand: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (watchId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (watchId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInWishlist(item.watchId)) {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (watchId) => {
        set({ items: get().items.filter((i) => i.watchId !== watchId) });
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.watchId)) {
          get().removeItem(item.watchId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (watchId) => {
        return get().items.some((i) => i.watchId === watchId);
      },

      getItemCount: () => get().items.length,
    }),
    {
      name: "tempus-wishlist",
    }
  )
);
