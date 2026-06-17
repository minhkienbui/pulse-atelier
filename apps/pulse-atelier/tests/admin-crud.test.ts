import { beforeEach, describe, expect, it } from "vitest";
import { useAdminStore } from "@/stores/admin-store";

describe("admin CRUD store", () => {
  beforeEach(() => {
    useAdminStore.getState().reset();
  });

  it("adds, edits, and deletes a product", () => {
    const store = useAdminStore.getState();

    store.addProduct({
      sku: "PA-NEW-001",
      name: "New Device",
      categoryId: "accessory",
      price: 990000,
      stock: 5,
      status: "active",
    });

    const created = useAdminStore.getState().products.find((product) => product.sku === "PA-NEW-001");
    expect(created?.name).toBe("New Device");

    useAdminStore.getState().updateProduct(created!.id, { name: "Updated Device", stock: 9 });
    expect(useAdminStore.getState().products.find((product) => product.id === created!.id)?.name).toBe(
      "Updated Device",
    );

    useAdminStore.getState().deleteProduct(created!.id);
    expect(useAdminStore.getState().products.find((product) => product.id === created!.id)).toBeUndefined();
  });

  it("adds, edits, and deletes a customer", () => {
    const store = useAdminStore.getState();

    store.addCustomer({
      name: "Test Customer",
      email: "test@example.com",
      phone: "0900000000",
      segment: "New",
      address: "1 Test Street",
    });

    const created = useAdminStore.getState().customers.find((customer) => customer.email === "test@example.com");
    expect(created?.name).toBe("Test Customer");

    useAdminStore.getState().updateCustomer(created!.id, { segment: "VIP" });
    expect(useAdminStore.getState().customers.find((customer) => customer.id === created!.id)?.segment).toBe(
      "VIP",
    );

    useAdminStore.getState().deleteCustomer(created!.id);
    expect(useAdminStore.getState().customers.find((customer) => customer.id === created!.id)).toBeUndefined();
  });

  it("adds, edits, and deletes a coupon", () => {
    const store = useAdminStore.getState();

    store.addCoupon({
      code: "NEW10",
      type: "percent",
      value: 10,
      usageLimit: 50,
      active: true,
    });

    const created = useAdminStore.getState().coupons.find((coupon) => coupon.code === "NEW10");
    expect(created?.value).toBe(10);

    useAdminStore.getState().updateCoupon(created!.id, { value: 12 });
    expect(useAdminStore.getState().coupons.find((coupon) => coupon.id === created!.id)?.value).toBe(12);

    useAdminStore.getState().deleteCoupon(created!.id);
    expect(useAdminStore.getState().coupons.find((coupon) => coupon.id === created!.id)).toBeUndefined();
  });
});
