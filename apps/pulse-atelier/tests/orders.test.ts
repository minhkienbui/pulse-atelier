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
