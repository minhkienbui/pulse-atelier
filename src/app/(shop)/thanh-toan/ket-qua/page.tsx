import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyVnpaySignature } from "@/lib/payments/vnpay";
import { formatPrice } from "@/lib/utils";
import ClearCartOnPaid from "@/components/checkout/ClearCartOnPaid";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function toUrlSearchParams(params: SearchParams) {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(params)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (value) searchParams.set(key, value);
  }

  return searchParams;
}

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const urlSearchParams = toUrlSearchParams(params);
  const txnRef = firstParam(params, "vnp_TxnRef");
  const responseCode = firstParam(params, "vnp_ResponseCode");
  const isSigned = urlSearchParams.has("vnp_SecureHash");
  const isValidSignature = isSigned
    ? verifyVnpaySignature(urlSearchParams)
    : false;
  const payment = txnRef
    ? await prisma.paymentTransaction.findUnique({
        where: { providerTxnRef: txnRef },
        include: { order: true },
      })
    : null;
  const paid = isValidSignature && responseCode === "00";
  const failed = isValidSignature && responseCode && responseCode !== "00";
  const invalid = isSigned && !isValidSignature;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      {paid && <ClearCartOnPaid />}
      <div className="max-w-lg w-full glass-dark p-8 sm:p-10 rounded-2xl border border-dark-border/30 text-center">
        <ResultIcon paid={paid} failed={Boolean(failed)} invalid={invalid} />
        <h1 className="heading-serif text-2xl sm:text-3xl text-ivory mb-3">
          {paid
            ? "Thanh toán đang được xác nhận"
            : failed
              ? "Thanh toán không thành công"
              : invalid
                ? "Chữ ký thanh toán không hợp lệ"
                : "Đang chờ kết quả thanh toán"}
        </h1>
        <p className="text-sm text-ivory/45 leading-6 mb-6">
          {paid
            ? "Tempus đã nhận phản hồi thành công từ VNPAY. Nếu IPN chưa cập nhật tức thời, trạng thái đơn sẽ được đồng bộ trong giây lát."
            : failed
              ? "Giao dịch VNPAY chưa hoàn tất. Bạn có thể thử thanh toán lại hoặc chọn COD."
              : invalid
                ? "Liên kết trả về không vượt qua kiểm tra bảo mật. Vui lòng liên hệ Tempus để được hỗ trợ."
                : "Chúng tôi chưa nhận đủ dữ liệu phản hồi từ VNPAY."}
        </p>

        {payment && (
          <div className="space-y-3 text-sm text-ivory/50 text-left bg-dark-bg/40 p-4 rounded-xl border border-dark-border/20 mb-8">
            <div className="flex justify-between">
              <span>Mã đơn</span>
              <span className="text-gold/80 font-medium">
                {payment.order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Trạng thái thanh toán</span>
              <span className="text-ivory/80 font-medium">{payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền</span>
              <span className="text-gold font-semibold">
                {formatPrice(payment.amount)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/tai-khoan" className="btn-gold flex-1 py-3 text-sm">
            Xem đơn hàng
          </Link>
          <Link href="/bo-suu-tap" className="btn-outline-gold flex-1 py-3 text-sm">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResultIcon({
  paid,
  failed,
  invalid,
}: {
  paid: boolean;
  failed: boolean;
  invalid: boolean;
}) {
  const className =
    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border";

  if (paid) {
    return (
      <div className={`${className} bg-gold/10 border-gold/30`}>
        <CheckCircle size={32} className="text-gold" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className={`${className} bg-red-500/10 border-red-500/30`}>
        <XCircle size={32} className="text-red-400" />
      </div>
    );
  }

  if (invalid) {
    return (
      <div className={`${className} bg-amber-500/10 border-amber-500/30`}>
        <AlertCircle size={32} className="text-amber-400" />
      </div>
    );
  }

  return (
    <div className={`${className} bg-gold/10 border-gold/30`}>
      <Clock size={32} className="text-gold" />
    </div>
  );
}
