"use server";

import { auth } from "@/auth";
import { checkoutSchema } from "@/lib/checkout/validation";
import {
  createPendingOrder,
  validateCartItems,
} from "@/data/orders";
import { prisma } from "@/lib/prisma";
import {
  createVnpayPaymentUrl,
  getVnpayConfig,
} from "@/lib/payments/vnpay";

export type CheckoutActionResult =
  | {
      ok: true;
      redirectTo: string;
      clearCart: boolean;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      itemErrors?: Record<string, string>;
    };

export async function createCheckout(
  rawInput: unknown
): Promise<CheckoutActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "Vui lòng đăng nhập trước khi thanh toán.",
    };
  }

  const parsed = checkoutSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin thanh toán.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validation = await validateCartItems(parsed.data.items);

  if (Object.keys(validation.errors).length > 0) {
    return {
      ok: false,
      message: "Một số sản phẩm trong giỏ hàng không còn khả dụng.",
      itemErrors: validation.errors,
    };
  }

  if (validation.items.length === 0) {
    return {
      ok: false,
      message: "Giỏ hàng không có sản phẩm hợp lệ.",
    };
  }

  if (parsed.data.paymentMethod === "VNPAY") {
    try {
      getVnpayConfig();
    } catch {
      return {
        ok: false,
        message: "Cổng VNPAY chưa được cấu hình đầy đủ.",
      };
    }
  }

  const order = await createPendingOrder({
    userId: session.user.id,
    items: validation.items,
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    customerPhone: parsed.data.customerPhone,
    shippingAddress: `${parsed.data.shippingAddress}, ${parsed.data.shippingCity}`,
    note: parsed.data.note,
    paymentMethod: parsed.data.paymentMethod,
    shippingFee: 0,
  });

  if (parsed.data.paymentMethod === "VNPAY") {
    const payment = await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "VNPAY",
        status: "PENDING",
        amount: order.total,
        providerTxnRef: order.orderNumber,
        providerPayload: {
          orderNumber: order.orderNumber,
        },
      },
    });
    const paymentUrl = createVnpayPaymentUrl({
      orderNumber: order.orderNumber,
      amount: order.total,
      transactionRef: payment.providerTxnRef || order.orderNumber,
    });

    return {
      ok: true,
      redirectTo: paymentUrl,
      clearCart: false,
    };
  }

  return {
    ok: true,
    redirectTo: `/thanh-toan/xac-nhan?orderId=${order.id}`,
    clearCart: true,
  };
}
