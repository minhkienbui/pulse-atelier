import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyVnpaySignature,
  vnpayParamsToObject,
} from "@/lib/payments/vnpay";

function vnpayResponse(RspCode: string, Message: string) {
  return NextResponse.json({ RspCode, Message });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  if (!verifyVnpaySignature(params)) {
    return vnpayResponse("97", "Invalid signature");
  }

  const txnRef = params.get("vnp_TxnRef");
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const amount = Number(params.get("vnp_Amount") || "0") / 100;

  if (!txnRef) {
    return vnpayResponse("01", "Order not found");
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { providerTxnRef: txnRef },
    include: { order: true },
  });

  if (!payment) {
    return vnpayResponse("01", "Order not found");
  }

  if (payment.amount !== Math.round(amount)) {
    return vnpayResponse("04", "Invalid amount");
  }

  if (payment.status === "PAID") {
    return vnpayResponse("00", "Order already confirmed");
  }

  const payload = vnpayParamsToObject(params);

  if (responseCode === "00" && transactionStatus === "00") {
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          providerPayload: payload,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    return vnpayResponse("00", "Confirm success");
  }

  await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      providerPayload: payload,
    },
  });

  return vnpayResponse("00", "Payment failed");
}
