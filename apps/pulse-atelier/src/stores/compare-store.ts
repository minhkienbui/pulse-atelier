"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const COMPARE_LIMIT = 4;

export function canAddToCompare(productIds: string[], productId: string) {
  return !productIds.includes(productId) && productIds.length < COMPARE_LIMIT;
}

interface CompareState {
  productIds: string[];
  add: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (productId) => {
        const { productIds } = get();

        if (!canAddToCompare(productIds, productId)) {
          return false;
        }

        set({ productIds: [...productIds, productId] });
        return true;
      },
      remove: (productId) => set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    { name: "pulse-compare" },
  ),
);
