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
