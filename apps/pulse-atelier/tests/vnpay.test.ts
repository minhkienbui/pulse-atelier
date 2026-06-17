import { beforeEach, describe, expect, it } from "vitest";
import {
  createVnpayPaymentUrl,
  verifyVnpaySignature,
  vnpayParamsToObject,
} from "@/lib/vnpay";

describe("VNPAY payment helper library", () => {
  beforeEach(() => {
    process.env.VNPAY_TMN_CODE = "TEMPUS";
    process.env.VNPAY_HASH_SECRET = "super-secret";
    process.env.VNPAY_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    process.env.VNPAY_RETURN_URL = "http://localhost:3100/thanh-toan/ket-qua";
  });

  it("creates a correctly signed VNPAY URL and verifies it successfully", () => {
    const paymentUrl = createVnpayPaymentUrl({
      orderNumber: "PA-123456",
      amount: 100000,
      transactionRef: "PA-123456",
      ipAddress: "127.0.0.1",
      locale: "vn",
    });

    const url = new URL(paymentUrl);
    const params = url.searchParams;
    const payload = vnpayParamsToObject(params);

    expect(url.origin + url.pathname).toBe(process.env.VNPAY_PAYMENT_URL);
    expect(payload.vnp_TmnCode).toBe("TEMPUS");
    expect(payload.vnp_Amount).toBe("10000000"); // 100,000 * 100
    expect(payload.vnp_TxnRef).toBe("PA-123456");
    expect(verifyVnpaySignature(params)).toBe(true);
  });

  it("fails signature verification if parameters are tampered with", () => {
    const paymentUrl = createVnpayPaymentUrl({
      orderNumber: "PA-123456",
      amount: 100000,
      transactionRef: "PA-123456",
    });

    const url = new URL(paymentUrl);
    url.searchParams.set("vnp_Amount", "20000000"); // Tampered amount

    expect(verifyVnpaySignature(url.searchParams)).toBe(false);
  });
});
