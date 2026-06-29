# VNPAY QR Payment Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the VNPAY Sandbox payment gateway to support banking QR code payment in the Checkout flow.

**Architecture:** Copy VNPAY cryptographic helpers to the local library. Expose Server Actions to securely generate signed payment URLs and verify signatures. Redirect to VNPAY on checkout, and update Zustand order status when the user is redirected back to the payment result page.

**Tech Stack:** Next.js Server Actions, Zustand store, VNPAY Sandbox API.

---

## Proposed Changes

### Task 1: Environment Variables Configuration

**Files:**
- Modify: [apps/pulse-atelier/.env](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/.env)

- [ ] **Step 1: Add VNPAY sandbox configuration to .env**
  Open `.env` and append:
  ```env
  VNPAY_TMN_CODE="TEMPUS"
  VNPAY_HASH_SECRET="super-secret"
  VNPAY_PAYMENT_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
  VNPAY_RETURN_URL="http://localhost:3100/thanh-toan/ket-qua"
  ```
- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/.env
  git commit -m "config: add VNPAY environment variables placeholders"
  ```

---

### Task 2: Core VNPAY Cryptographic Helpers

**Files:**
- Create: [apps/pulse-atelier/src/lib/vnpay.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/vnpay.ts)

- [ ] **Step 1: Write helper utility src/lib/vnpay.ts**
  Create `src/lib/vnpay.ts` with the following content:
  ```typescript
  import crypto from "crypto";

  type VnpayPrimitive = string | number;

  export interface VnpayPaymentInput {
    orderNumber: string;
    amount: number;
    transactionRef: string;
    ipAddress?: string;
    locale?: "vn" | "en";
  }

  export interface VnpayConfig {
    tmnCode: string;
    hashSecret: string;
    paymentUrl: string;
    returnUrl: string;
  }

  function requireEnv(name: string) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`${name} is required for VNPAY integration.`);
    }
    return value;
  }

  export function getVnpayConfig(): VnpayConfig {
    return {
      tmnCode: requireEnv("VNPAY_TMN_CODE"),
      hashSecret: requireEnv("VNPAY_HASH_SECRET"),
      paymentUrl:
        process.env.VNPAY_PAYMENT_URL ||
        "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      returnUrl:
        process.env.VNPAY_RETURN_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100"}/thanh-toan/ket-qua`,
    };
  }

  function formatVnpayDate(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join("");
  }

  function normalizeParams(params: Record<string, VnpayPrimitive>) {
    return Object.entries(params)
      .filter(([, value]) => value !== "" && value !== undefined && value !== null)
      .sort(([left], [right]) => left.localeCompare(right))
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {});
  }

  function buildQuery(params: Record<string, string>) {
    return Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value).replace(
            /%20/g,
            "+"
          )}`
      )
      .join("&");
  }

  function signParams(params: Record<string, string>, hashSecret: string) {
    const signData = buildQuery(params);
    return crypto
      .createHmac("sha512", hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");
  }

  export function createVnpayPaymentUrl(input: VnpayPaymentInput) {
    const config = getVnpayConfig();
    const params = normalizeParams({
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: Math.round(input.amount) * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: input.transactionRef,
      vnp_OrderInfo: `Thanh toan don hang ${input.orderNumber}`,
      vnp_OrderType: "other",
      vnp_Locale: input.locale || "vn",
      vnp_ReturnUrl: config.returnUrl,
      vnp_IpAddr: input.ipAddress || "127.0.0.1",
      vnp_CreateDate: formatVnpayDate(new Date()),
    });
    const secureHash = signParams(params, config.hashSecret);
    const query = buildQuery({
      ...params,
      vnp_SecureHash: secureHash,
    });
    return `${config.paymentUrl}?${query}`;
  }

  function paramsToRecord(params: URLSearchParams) {
    const record: Record<string, string> = {};
    params.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  export function verifyVnpaySignature(params: URLSearchParams) {
    const config = getVnpayConfig();
    const record = paramsToRecord(params);
    const receivedHash = record.vnp_SecureHash;

    delete record.vnp_SecureHash;
    delete record.vnp_SecureHashType;

    if (!receivedHash) return false;

    const signedParams = normalizeParams(record);
    const expectedHash = signParams(signedParams, config.hashSecret);
    const received = Buffer.from(receivedHash, "hex");
    const expected = Buffer.from(expectedHash, "hex");

    return (
      received.length === expected.length &&
      crypto.timingSafeEqual(received, expected)
    );
  }

  export function vnpayParamsToObject(params: URLSearchParams) {
    return paramsToRecord(params);
  }
  ```
- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/src/lib/vnpay.ts
  git commit -m "feat: add local vnpay crypto helpers"
  ```

---

### Task 3: VNPAY Server Actions

**Files:**
- Create: [apps/pulse-atelier/src/lib/vnpay-actions.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/lib/vnpay-actions.ts)

- [ ] **Step 1: Write vnpay-actions.ts**
  Create `src/lib/vnpay-actions.ts` with server functions to create URLs and verify signatures:
  ```typescript
  "use server";

  import { createVnpayPaymentUrl, verifyVnpaySignature } from "./vnpay";

  export async function createVnpayUrlAction(input: {
    orderNumber: string;
    amount: number;
    transactionRef: string;
  }) {
    try {
      const url = createVnpayPaymentUrl({
        orderNumber: input.orderNumber,
        amount: input.amount,
        transactionRef: input.transactionRef,
      });
      return { ok: true as const, url };
    } catch (err: any) {
      return { ok: false as const, error: err.message || "Failed to create VNPAY payment URL." };
    }
  }

  export async function verifyVnpayResponseAction(searchParamsString: string) {
    try {
      const params = new URLSearchParams(searchParamsString);
      const isValid = verifyVnpaySignature(params);
      const responseCode = params.get("vnp_ResponseCode") || "";
      const orderNumber = params.get("vnp_TxnRef") || "";
      const amountRaw = params.get("vnp_Amount") || "0";
      const amount = Math.round(Number(amountRaw) / 100);

      return {
        ok: true as const,
        isValid,
        responseCode,
        orderNumber,
        amount,
      };
    } catch (err: any) {
      return { ok: false as const, error: err.message || "Failed to verify VNPAY response." };
    }
  }
  ```
- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/src/lib/vnpay-actions.ts
  git commit -m "feat: add Server Actions for VNPAY integration"
  ```

---

### Task 4: Integrate VNPAY Checkout Option

**Files:**
- Modify: [apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx)

- [ ] **Step 1: Update payment methods labels**
  Change the bank payment label to "Thanh toan QR / VNPAY":
  ```typescript
  // Around line 21
  { value: "bank", label: "Thanh toan QR / VNPAY", icon: Landmark, disabled: false },
  ```
- [ ] **Step 2: Import Server Action and navigate on submit**
  Import the server action:
  ```typescript
  import { createVnpayUrlAction } from "@/lib/vnpay-actions";
  ```
  Update `handleSubmit` to handle `"bank"` redirection:
  ```typescript
  // Inside handleSubmit:
  addOrder(order);
  useAdminStore.getState().addOrder(order);
  clearCart();

  if (payload.paymentMethod === "bank") {
    // Call Server Action to generate VNPAY URL
    const res = await createVnpayUrlAction({
      orderNumber: order.orderNumber,
      amount: order.total,
      transactionRef: order.orderNumber,
    });
    if (res.ok) {
      window.location.href = res.url;
      return;
    } else {
      alert("Khong the tao URL VNPAY: " + res.error);
    }
  }

  setConfirmedOrder(order);
  setConfirmed(true);
  setConfirmationNumber(order.orderNumber);
  ```
- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/src/components/checkout/CheckoutForm.tsx
  git commit -m "feat: redirect user to VNPAY Sandbox when Bank payment method is chosen"
  ```

---

### Task 5: VNPAY Return Page

**Files:**
- Create: [apps/pulse-atelier/src/app/thanh-toan/ket-qua/page.tsx](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/src/app/thanh-toan/ket-qua/page.tsx)

- [ ] **Step 1: Write return page**
  Create a Client Component result page that handles signature verification and updates order stores:
  ```typescript
  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { useSearchParams } from "next/navigation";
  import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
  import { CustomerShell } from "@/components/layout/CustomerShell";
  import { Badge } from "@/components/ui/Badge";
  import { formatCurrency } from "@/lib/utils";
  import { useOrderStore } from "@/stores/order-store";
  import { useAdminStore } from "@/stores/admin-store";
  import { verifyVnpayResponseAction } from "@/lib/vnpay-actions";

  export default function VnpayReturnPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "failed" | "invalid">("loading");
    const [details, setDetails] = useState({ orderNumber: "", amount: 0 });

    useEffect(() => {
      async function verify() {
        const queryParamsString = searchParams.toString();
        if (!queryParamsString) {
          setStatus("invalid");
          return;
        }

        const res = await verifyVnpayResponseAction(queryParamsString);
        if (res.ok) {
          if (!res.isValid) {
            setStatus("invalid");
          } else if (res.responseCode === "00") {
            setDetails({ orderNumber: res.orderNumber, amount: res.amount });

            // Mark order as paid in stores
            const orderId = `order-${res.orderNumber.toLowerCase()}`;
            useOrderStore.getState().updateOrder(orderId, { paymentStatus: "paid", status: "confirmed" });
            useAdminStore.getState().updateOrder(orderId, { paymentStatus: "paid", status: "confirmed" });

            setStatus("success");
          } else {
            setDetails({ orderNumber: res.orderNumber, amount: res.amount });
            setStatus("failed");
          }
        } else {
          setStatus("invalid");
        }
      }
      verify();
    }, [searchParams]);

    return (
      <CustomerShell>
        <section className="shell py-16 flex flex-col items-center justify-center">
          <div className="max-w-md w-full rounded-lg border border-line bg-panel p-6 text-center">
            {status === "loading" ? (
              <div className="py-8">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pulse border-t-transparent"></div>
                <h2 className="mt-5 text-xl font-semibold text-frost">Dang xac thuc thanh toan...</h2>
                <p className="mt-2 text-sm text-steel">Vui long khong tat trinh duyet.</p>
              </div>
            ) : status === "success" ? (
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pulse/12 text-pulse">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-frost">Thanh toan thanh cong!</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  Don hang {details.orderNumber} da duoc thanh toan va xac nhan qua cong VNPAY.
                </p>
                <div className="mt-5 rounded-lg border border-line bg-graphite p-4 text-left text-sm text-steel">
                  <div className="flex justify-between">
                    <span>Ma don hang</span>
                    <span className="font-semibold text-frost">{details.orderNumber}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>So tien</span>
                    <span className="font-semibold text-pulse">{formatCurrency(details.amount)}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Trang thai</span>
                    <span className="font-semibold text-frost">Da thanh toan (VNPAY)</span>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link href="/tai-khoan" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]">
                    Xem don hang
                  </Link>
                  <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
                    Tiep tuc mua
                  </Link>
                </div>
              </div>
            ) : status === "failed" ? (
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/12 text-danger">
                  <XCircle size={28} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-frost">Thanh toan that bai</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  Giao dich qua VNPAY khong thanh cong hoac bi huy.
                </p>
                <div className="mt-6 grid gap-3">
                  <Link href="/gio-hang" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]">
                    Thanh toan lai
                  </Link>
                  <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
                    Xem san pham khac
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/12 text-warning">
                  <AlertCircle size={28} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-frost">Chu ky khong hop le</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  Chu ky bao mat cua giao dich khong chinh xac hoac da bi sua doi.
                </p>
                <div className="mt-6">
                  <Link href="/san-pham" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel">
                    Quay ve cua hang
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </CustomerShell>
    );
  }
  ```
- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/src/app/thanh-toan/ket-qua/page.tsx
  git commit -m "feat: add VNPAY return page and status updating UI"
  ```

---

### Task 6: Unit Test for VNPAY Integration

**Files:**
- Create: [apps/pulse-atelier/tests/vnpay.test.ts](file:///c:/Users/mkb/.gemini/antigravity-ide/scratch/tempus-vn/apps/pulse-atelier/tests/vnpay.test.ts)

- [ ] **Step 1: Write tests/vnpay.test.ts**
  Create `tests/vnpay.test.ts` to test parameter encoding, URL generation, and signature verification:
  ```typescript
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
  ```
- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add apps/pulse-atelier/tests/vnpay.test.ts
  git commit -m "test: add vnpay cryptographic unit tests"
  ```
