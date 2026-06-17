import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { getOrderForCustomer } from "@/data/orders";
import { formatPrice } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  const params = (await searchParams) || {};
  const orderId = firstParam(params, "orderId");

  if (!orderId) {
    redirect("/tai-khoan");
  }

  const order = await getOrderForCustomer(orderId, session.user.id);

  if (!order) {
    redirect("/tai-khoan");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-dark p-8 sm:p-10 rounded-2xl border border-gold/30 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 border border-gold/30">
          <CheckCircle size={32} className="text-gold" />
        </div>
        <h1 className="heading-serif text-2xl sm:text-3xl text-ivory mb-2">
          Đặt hàng thành công
        </h1>
        <p className="text-sm text-gold tracking-widest uppercase font-medium mb-6">
          {order.orderNumber}
        </p>
        <div className="space-y-3 text-sm text-ivory/50 text-left bg-dark-bg/40 p-4 rounded-xl border border-dark-border/20 mb-8">
          <div className="flex justify-between">
            <span>Người nhận</span>
            <span className="text-ivory/80 font-medium">
              {order.shippingName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thanh toán</span>
            <span className="text-gold/80 font-medium">
              {order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tổng cộng</span>
            <span className="text-gold font-semibold">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
        <Link href="/tai-khoan" className="btn-gold w-full py-4 text-sm">
          Xem đơn hàng
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
