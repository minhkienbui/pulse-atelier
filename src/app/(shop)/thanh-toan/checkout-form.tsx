"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { createCheckout } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

const inputClassName =
  "w-full px-4 py-3 bg-dark-bg/60 border border-dark-border rounded-lg text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/40 transition-colors";

export default function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isPending, startTransition] = useTransition();
  const [customerName, setCustomerName] = useState(defaultName);
  const [customerEmail, setCustomerEmail] = useState(defaultEmail);
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");
  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/gio-hang");
    }
  }, [cart.length, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createCheckout({
        items: cart.map((item) => ({
          watchId: item.watchId,
          quantity: item.quantity,
        })),
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        note,
        paymentMethod,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      if (result.clearCart) {
        clearCart();
      }

      if (result.redirectTo.startsWith("http")) {
        window.location.assign(result.redirectTo);
      } else {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <Link
          href="/gio-hang"
          className="inline-flex items-center gap-2 text-xs text-ivory/40 hover:text-gold transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Quay lại giỏ hàng
        </Link>

        <h1 className="heading-serif text-3xl text-ivory mb-8">Thanh toán</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-7 space-y-6">
            <section className="glass-dark p-6 rounded-2xl border border-dark-border/30 space-y-4">
              <h2 className="text-base font-semibold text-ivory/90 flex items-center gap-2 mb-2">
                <Truck size={18} className="text-gold" />
                Thông tin giao hàng
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Họ & tên *">
                  <input
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Số điện thoại *">
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Email *">
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
                <Field label="Địa chỉ nhận hàng *">
                  <input
                    required
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Tỉnh/Thành phố *">
                  <input
                    required
                    value={shippingCity}
                    onChange={(event) => setShippingCity(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Ghi chú đơn hàng">
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className={`${inputClassName} resize-none`}
                />
              </Field>
            </section>

            <section className="glass-dark p-6 rounded-2xl border border-dark-border/30 space-y-4">
              <h2 className="text-base font-semibold text-ivory/90 flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-gold" />
                Phương thức thanh toán
              </h2>

              {[
                {
                  value: "COD" as const,
                  title: "Thanh toán khi nhận hàng",
                  description:
                    "Nhân viên Tempus xác nhận đơn trước khi giao hàng bảo mật.",
                },
                {
                  value: "VNPAY" as const,
                  title: "Thanh toán qua VNPAY",
                  description:
                    "Chuyển sang cổng VNPAY để thanh toán bằng thẻ, tài khoản ngân hàng hoặc QR.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === option.value
                      ? "bg-gold/[0.04] border-gold/30"
                      : "bg-dark-card/30 border-dark-border/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    className="mt-1 text-gold focus:ring-gold"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ivory/90">
                      {option.title}
                    </span>
                    <span className="block text-xs text-ivory/40 mt-1 leading-relaxed">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </section>
          </div>

          <aside className="lg:col-span-5">
            <div className="glass-dark p-6 rounded-2xl border border-dark-border/30 sticky top-28">
              <h2 className="text-base font-semibold text-ivory/90 flex items-center gap-2 mb-6">
                <ShoppingBag size={18} className="text-gold" />
                Đơn hàng của bạn
              </h2>

              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-dark-border/10 mb-6">
                {cart.map((item) => (
                  <div key={item.watchId} className="flex gap-4 pt-4 first:pt-0">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-surface border border-dark-border/20 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-ivory/80 truncate">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-ivory/30 mt-0.5">
                        {item.brand}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-ivory/50">
                          SL: {item.quantity}
                        </span>
                        <span className="text-xs font-semibold text-gold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-6 border-y border-dark-border/15 space-y-3 text-xs text-ivory/50">
                <div className="flex justify-between">
                  <span>
                    Tạm tính (
                    {cart.reduce((count, item) => count + item.quantity, 0)} sản
                    phẩm)
                  </span>
                  <span className="text-ivory/80 font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển bảo hiểm</span>
                  <span className="text-emerald-400 font-medium">Miễn phí</span>
                </div>
              </div>

              <div className="py-6 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ivory/90">
                  Tổng cộng
                </span>
                <span className="text-xl font-bold text-gold heading-serif">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-dark-bg/50 border border-dark-border/20 mb-6 text-[10px] text-ivory/30">
                <ShieldCheck size={14} className="text-gold/70" />
                <span>Server xác thực lại giá và tồn kho trước khi tạo đơn.</span>
              </div>

              <button
                type="submit"
                disabled={isPending || cart.length === 0}
                className="btn-gold w-full py-4 text-sm disabled:opacity-50"
              >
                {isPending ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs text-ivory/40 font-medium">{label}</span>
      {children}
    </label>
  );
}
