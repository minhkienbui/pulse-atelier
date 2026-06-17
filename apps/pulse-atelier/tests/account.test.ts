import { describe, expect, it } from "vitest";
import { supportTickets } from "@/data/admin";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { products } from "@/data/products";
import { buildAccountSnapshot } from "@/lib/account";

describe("account helpers", () => {
  it("returns null customer data for an unknown customer", () => {
    const snapshot = buildAccountSnapshot({
      customerId: "missing-customer",
      customers,
      orders,
      products,
      tickets: supportTickets,
      wishlistProductIds: [],
      comparedProductIds: [],
    });

    expect(snapshot.customer).toBeNull();
    expect(snapshot.orders).toHaveLength(0);
  });

  it("builds profile, wishlist, compared products, owned devices, and tickets for a customer", () => {
    const createdOrder = {
      ...orders[0],
      id: "created-pa-20260616-1001",
      orderNumber: "PA-20260616-1001",
      customerId: "cust-minh-anh",
      createdAt: "2026-06-16T09:00:00.000Z",
    };

    const snapshot = buildAccountSnapshot({
      customerId: "cust-minh-anh",
      customers,
      orders: [createdOrder, ...orders],
      products,
      tickets: supportTickets,
      wishlistProductIds: ["prod-sonic-air-max"],
      comparedProductIds: ["prod-aura-watch-pro", "missing-product"],
    });

    expect(snapshot.customer?.name).toBe("Minh Anh");
    expect(snapshot.orders[0].orderNumber).toBe("PA-20260616-1001");
    expect(snapshot.orders.map((order) => order.orderNumber)).toEqual(["PA-20260616-1001", "PA-1006", "PA-1001"]);
    expect(snapshot.wishlistProducts.map((product) => product.id)).toEqual(["prod-sonic-air-max"]);
    expect(snapshot.comparedProducts.map((product) => product.id)).toEqual(["prod-aura-watch-pro"]);
    expect(snapshot.ownedDevices.map((product) => product.id)).toEqual(["prod-aura-watch-pro", "prod-pulse-charge-duo"]);
    expect(snapshot.supportTickets.map((ticket) => ticket.id)).toEqual(["ticket-006", "ticket-001"]);
  });
});
