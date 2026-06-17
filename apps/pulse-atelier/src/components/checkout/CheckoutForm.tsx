"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, Landmark, PackageCheck, WalletCards } from "lucide-react";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { customers } from "@/data/customers";
import { products } from "@/data/products";
import { calculateCartTotals, validateCheckout, type CheckoutInput } from "@/lib/checkout";
import { resolveCartLines } from "@/lib/cart";
import { createOrderFromCheckout, generateOrderNumber } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { useAdminStore } from "@/stores/admin-store";
import type { Order } from "@/types/domain";
import { createVnpayUrlAction } from "@/lib/vnpay-actions";

const paymentMethods = [
  { value: "cod", label: "Thanh toan khi nhan hang", icon: WalletCards, disabled: false },
  { value: "bank", label: "Thanh toan QR / VNPAY", icon: Landmark, disabled: false },
  { value: "card", label: "The ngan hang", icon: CreditCard, disabled: true },
];

function fieldClass(hasError: boolean) {
  return `mt-2 min-h-11 w-full rounded-lg border bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse ${
    hasError ? "border-danger" : "border-line"
  }`;
}

export function CheckoutForm() {
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const addOrder = useOrderStore((state) => state.addOrder);
  const seededCustomer = customers.find((item) => item.id === user?.customerId);
  const customer = {
    name: seededCustomer?.name ?? user?.name ?? "",
    email: seededCustomer?.email ?? user?.email ?? "",
    phone: seededCustomer?.phone ?? user?.phone ?? "",
    address: seededCustomer?.address ?? user?.address ?? "",
  };
  const [couponCode, setCouponCode] = useState("PULSE10");
  const [input, setInput] = useState<CheckoutInput>({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    paymentMethod: "cod",
    note: "",
    couponCode: "PULSE10",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutInput, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const lines = useMemo(() => resolveCartLines(cartItems, products), [cartItems]);
  const orderItems = lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.product.price,
  }));
  const totals = calculateCartTotals(orderItems, couponCode);

  const updateField = (field: keyof CheckoutInput, value: string) => {
    setInput((current) => ({ ...current, [field]: value, couponCode }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { ...input, couponCode };
    const result = validateCheckout(payload);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    const order = createOrderFromCheckout({
      orderNumber: generateOrderNumber(),
      customerId: user?.customerId ?? "guest-checkout",
      items: orderItems,
      shippingAddress: payload.address,
      note: payload.note,
      paymentMethod: payload.paymentMethod as "cod" | "bank",
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      createdAt: new Date().toISOString(),
    });

    addOrder(order);
    useAdminStore.getState().addOrder(order);
    clearCart();

    if (payload.paymentMethod === "bank") {
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
  };

  if (lines.length === 0 && !confirmed) {
    return (
      <EmptyState
        title="Gio hang dang trong"
        description="Them it nhat mot san pham truoc khi thanh toan."
        action={
          <Link
            href="/san-pham"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
          >
            Chon san pham
          </Link>
        }
      />
    );
  }

  if (confirmed) {
    return (
      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-lg border border-line bg-panel p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-pulse/30 bg-pulse/12 text-pulse">
            <CheckCircle2 size={24} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-frost">Don hang da duoc tao</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
            Ma don {confirmationNumber} dang o trang thai cho xu ly. Chung toi se cap nhat tien do khi don hang
            duoc xac nhan va ban giao cho don vi van chuyen.
          </p>
          {confirmedOrder ? (
            <div className="mt-5 rounded-lg border border-line bg-graphite p-4 text-sm text-steel">
              <div className="flex justify-between gap-4">
                <span>Tong thanh toan</span>
                <span className="font-semibold text-frost">{formatCurrency(confirmedOrder.total ?? 0)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span>Phuong thuc</span>
                <span className="font-semibold text-frost">
                  {confirmedOrder.paymentMethod === "bank" ? "Chuyen khoan ngan hang" : "Thanh toan khi nhan hang"}
                </span>
              </div>
            </div>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/theo-doi-don-hang?order=${confirmationNumber}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
            >
              Theo doi don hang
            </Link>
            <Link
              href="/tai-khoan"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel-soft px-4 text-sm font-semibold text-frost transition-colors hover:border-pulse/50 hover:bg-panel"
            >
              Xem tai khoan
            </Link>
          </div>
        </div>
        <CartSummary
          orderItems={confirmedOrder?.items ?? []}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          checkoutHref="/san-pham"
          actionLabel="Tiep tuc mua sam"
        />
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-panel p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-frost">Thong tin giao hang</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-steel">Ho ten</span>
            <input
              value={input.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={fieldClass(Boolean(errors.name))}
            />
            {errors.name ? <p className="mt-2 text-xs text-danger">{errors.name}</p> : null}
          </label>
          <label>
            <span className="text-sm font-semibold text-steel">Email</span>
            <input
              value={input.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={fieldClass(Boolean(errors.email))}
            />
            {errors.email ? <p className="mt-2 text-xs text-danger">{errors.email}</p> : null}
          </label>
          <label>
            <span className="text-sm font-semibold text-steel">Dien thoai</span>
            <input
              value={input.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={fieldClass(Boolean(errors.phone))}
            />
            {errors.phone ? <p className="mt-2 text-xs text-danger">{errors.phone}</p> : null}
          </label>
          <label>
            <span className="text-sm font-semibold text-steel">Ma uu dai</span>
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              className={fieldClass(false)}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-steel">Dia chi</span>
            <textarea
              value={input.address}
              onChange={(event) => updateField("address", event.target.value)}
              rows={3}
              className={`${fieldClass(Boolean(errors.address))} py-3`}
            />
            {errors.address ? <p className="mt-2 text-xs text-danger">{errors.address}</p> : null}
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-steel">Ghi chu</span>
            <textarea
              value={input.note}
              onChange={(event) => updateField("note", event.target.value)}
              rows={3}
              placeholder="Thoi gian giao, mau sac phu kien, yeu cau goi hang..."
              className="mt-2 min-h-24 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse"
            />
          </label>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-steel">Phuong thuc thanh toan</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const active = input.paymentMethod === method.value;

              return (
                <label
                  key={method.value}
                  className={`flex min-h-24 flex-col justify-between rounded-lg border p-4 transition-colors ${
                    method.disabled
                      ? "cursor-not-allowed border-line bg-graphite text-steel opacity-55"
                      : active
                        ? "cursor-pointer border-pulse bg-pulse/12 text-frost"
                        : "cursor-pointer border-line bg-graphite text-steel"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={active}
                    disabled={method.disabled}
                    onChange={(event) => updateField("paymentMethod", event.target.value)}
                    className="sr-only"
                  />
                  <Icon size={20} className={active ? "text-pulse" : "text-steel"} aria-hidden="true" />
                  <span className="text-sm font-semibold">{method.label}</span>
                  {method.disabled ? <span className="text-xs text-steel">Can ket noi cong thanh toan</span> : null}
                </label>
              );
            })}
          </div>
          {errors.paymentMethod ? <p className="mt-2 text-xs text-danger">{errors.paymentMethod}</p> : null}
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
        >
          <PackageCheck size={17} aria-hidden="true" />
          Dat hang {formatCurrency(totals.total)}
        </button>
      </form>

      <CartSummary
        orderItems={orderItems}
        couponCode={couponCode}
        onCouponCodeChange={setCouponCode}
        checkoutHref="/gio-hang"
        actionLabel="Quay lai gio"
      />
    </section>
  );
}
