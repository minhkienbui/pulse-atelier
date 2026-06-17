import { describe, expect, it } from "vitest";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import {
  getCustomerLifetimeStats,
  getLowStockProducts,
  getOrderCountByStatus,
  getRevenueTotal,
  getTopProducts,
} from "@/lib/admin";

describe("admin helpers", () => {
  it("calculates paid revenue from order items", () => {
    expect(getRevenueTotal(orders)).toBe(68_200_000);
  });

  it("counts orders by every status", () => {
    expect(getOrderCountByStatus(orders)).toEqual({
      pending: 1,
      confirmed: 1,
      packed: 1,
      shipping: 1,
      completed: 3,
      cancelled: 1,
    });
  });

  it("returns products whose stock has reached their low-stock threshold", () => {
    const lowStock = getLowStockProducts([
      { ...products[0], stock: 6, lowStockThreshold: 6 },
      { ...products[1], stock: 10, lowStockThreshold: 4 },
      { ...products[2], stock: 0, lowStockThreshold: 5 },
    ]);

    expect(lowStock.map((product) => product.id)).toEqual([
      "prod-garmin-vital-x",
      "prod-aura-watch-pro",
    ]);
  });

  it("returns top products by sold count", () => {
    expect(getTopProducts(products, 3).map((product) => product.id)).toEqual([
      "prod-aura-watch-pro",
      "prod-sonic-air-max",
      "prod-apple-watch-series-atelier",
    ]);
  });

  it("summarizes customer lifetime and returning metrics", () => {
    expect(getCustomerLifetimeStats(customers, orders)).toEqual({
      totalLifetimeSpend: 131_350_000,
      averageLifetimeSpend: 26_270_000,
      vipCustomers: 2,
      returningCustomers: 3,
    });
  });
});
