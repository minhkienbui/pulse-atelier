import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/checkout/validation";

const validCheckout = {
  items: [{ watchId: "watch_1", quantity: 1 }],
  customerName: "Lam Hoang Minh",
  customerEmail: "MINH@TEMPUS.VN",
  customerPhone: "0909123456",
  shippingAddress: "88 Dong Khoi, Quan 1",
  shippingCity: "TP. Ho Chi Minh",
  paymentMethod: "VNPAY",
};

describe("checkout validation", () => {
  it("normalizes customer email and accepts VNPAY checkout", () => {
    const result = checkoutSchema.parse(validCheckout);

    expect(result.customerEmail).toBe("minh@tempus.vn");
    expect(result.paymentMethod).toBe("VNPAY");
  });

  it("rejects empty carts", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects quantities above the per-item checkout limit", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [{ watchId: "watch_1", quantity: 6 }],
    });

    expect(result.success).toBe(false);
  });
});
