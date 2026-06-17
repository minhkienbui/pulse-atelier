import { beforeEach, describe, expect, it } from "vitest";
import {
  createVnpayPaymentUrl,
  verifyVnpaySignature,
  vnpayParamsToObject,
} from "@/lib/payments/vnpay";

describe("VNPAY payment helpers", () => {
  beforeEach(() => {
    process.env.VNPAY_TMN_CODE = "TEMPUS";
    process.env.VNPAY_HASH_SECRET = "super-secret";
    process.env.VNPAY_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    process.env.VNPAY_RETURN_URL = "https://tempus.test/thanh-toan/ket-qua";
  });

  it("creates a signed payment URL that verifies successfully", () => {
    const paymentUrl = createVnpayPaymentUrl({
      orderNumber: "TP-0001",
      amount: 123456,
      transactionRef: "pay_123",
      ipAddress: "127.0.0.1",
      locale: "vn",
    });
    const url = new URL(paymentUrl);
    const params = url.searchParams;
    const payload = vnpayParamsToObject(params);

    expect(url.origin + url.pathname).toBe(process.env.VNPAY_PAYMENT_URL);
    expect(payload.vnp_TmnCode).toBe("TEMPUS");
    expect(payload.vnp_Amount).toBe("12345600");
    expect(payload.vnp_TxnRef).toBe("pay_123");
    expect(verifyVnpaySignature(params)).toBe(true);
  });

  it("rejects tampered signed parameters", () => {
    const url = new URL(
      createVnpayPaymentUrl({
        orderNumber: "TP-0002",
        amount: 500000,
        transactionRef: "pay_456",
      })
    );

    url.searchParams.set("vnp_Amount", "1");

    expect(verifyVnpaySignature(url.searchParams)).toBe(false);
  });
});
