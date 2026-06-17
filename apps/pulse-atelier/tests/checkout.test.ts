import { describe, expect, it } from "vitest";
import type { OrderItem } from "@/types/domain";
import { calculateCartTotals, validateCheckout, type CheckoutInput } from "@/lib/checkout";

describe("checkout helpers", () => {
  it("applies the PULSE10 discount and standard shipping below the free threshold", () => {
    const items: OrderItem[] = [
      { productId: "prod-aura-watch-pro", quantity: 1, unitPrice: 12990000 },
      { productId: "prod-pulse-charge-duo", quantity: 2, unitPrice: 1490000 },
    ];
    const totals = calculateCartTotals(items, "PULSE10");

    expect(totals).toEqual({
      subtotal: 15970000,
      discount: 1597000,
      shippingFee: 45000,
      total: 14418000,
    });
  });

  it("uses free shipping when subtotal reaches twenty million", () => {
    const totals = calculateCartTotals([
      { productId: "prod-aura-watch-pro", quantity: 1, unitPrice: 12990000 },
      { productId: "prod-garmin-vital-x", quantity: 1, unitPrice: 15990000 },
    ]);

    expect(totals).toEqual({
      subtotal: 28980000,
      discount: 0,
      shippingFee: 0,
      total: 28980000,
    });
  });

  it("uses free shipping for an empty cart total", () => {
    expect(calculateCartTotals([])).toEqual({
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
    });
  });

  it("validates checkout contact, address, and payment requirements", () => {
    const input: CheckoutInput = {
      name: "",
      email: "minh.anh",
      phone: "123",
      address: "",
      paymentMethod: "cash",
      note: "",
      couponCode: "",
    };

    expect(validateCheckout(input)).toEqual({
      ok: false,
      errors: {
        name: "Name is required.",
        email: "A valid email is required.",
        phone: "A valid phone number is required.",
        address: "Address is required.",
        paymentMethod: "Payment method must be cod or bank.",
      },
    });
  });

  it("rejects disabled card payment until a provider is connected", () => {
    const input: CheckoutInput = {
      name: "Minh Anh",
      email: "minh.anh@example.com",
      phone: "0901002003",
      address: "12 Nguyen Hue, Quan 1, TP HCM",
      paymentMethod: "card",
      note: "",
      couponCode: "",
    };

    expect(validateCheckout(input)).toEqual({
      ok: false,
      errors: {
        paymentMethod: "Card payment is not available until a payment provider is connected.",
      },
    });
  });

  it("accepts a valid checkout input", () => {
    const input: CheckoutInput = {
      name: "Minh Anh",
      email: "minh.anh@example.com",
      phone: "0901002003",
      address: "12 Nguyen Hue, Quan 1, TP HCM",
      paymentMethod: "cod",
      note: "Giao sau 18h.",
      couponCode: "PULSE10",
    };

    expect(validateCheckout(input)).toEqual({ ok: true, errors: {} });
  });
});
