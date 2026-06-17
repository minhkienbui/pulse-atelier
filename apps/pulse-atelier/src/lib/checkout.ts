import type { OrderItem } from "@/types/domain";

export interface CheckoutInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  note: string;
  couponCode: string;
}

export interface CheckoutValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof CheckoutInput, string>>;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

const FREE_SHIPPING_THRESHOLD = 20_000_000;
const STANDARD_SHIPPING_FEE = 45_000;
const VALID_PAYMENT_METHODS = new Set(["cod", "bank"]);

export function calculateCartTotals(items: OrderItem[], couponCode = ""): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = couponCode.trim().toUpperCase() === "PULSE10" ? Math.round(subtotal * 0.1) : 0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;

  return {
    subtotal,
    discount,
    shippingFee,
    total: Math.max(0, subtotal - discount + shippingFee),
  };
}

export function validateCheckout(input: CheckoutInput): CheckoutValidationResult {
  const errors: CheckoutValidationResult["errors"] = {};

  if (!input.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "A valid email is required.";
  }

  if (!/^[0-9+\-\s()]{8,}$/.test(input.phone.trim())) {
    errors.phone = "A valid phone number is required.";
  }

  if (!input.address.trim()) {
    errors.address = "Address is required.";
  }

  if (input.paymentMethod === "card") {
    errors.paymentMethod = "Card payment is not available until a payment provider is connected.";
  } else if (!VALID_PAYMENT_METHODS.has(input.paymentMethod)) {
    errors.paymentMethod = "Payment method must be cod or bank.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
