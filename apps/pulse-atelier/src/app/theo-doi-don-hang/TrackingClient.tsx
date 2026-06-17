"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Truck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { orders as seedOrders } from "@/data/orders";
import { products } from "@/data/products";
import { buildTrackingTimeline, findOrderByNumber, mergeOrders } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useOrderStore } from "@/stores/order-store";
import type { Order } from "@/types/domain";

function orderTotal(order: Order) {
  return order.total ?? order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

function statusVariant(status: Order["status"]) {
  if (status === "completed") return "mint";
  if (status === "cancelled") return "danger";
  if (status === "pending") return "warning";
  return "violet";
}

export function TrackingClient() {
  const searchParams = useSearchParams();
  const createdOrders = useOrderStore((state) => state.orders);
  const user = useAuthStore((state) => state.user);
  const urlOrderNumber = searchParams.get("order") ?? "";
  const allOrders = useMemo(() => mergeOrders(seedOrders, createdOrders), [createdOrders]);
  const foundOrder = urlOrderNumber ? findOrderByNumber(allOrders, urlOrderNumber) : null;
  const recentOrders = user?.customerId
    ? allOrders.filter((order) => order.customerId === user.customerId).slice(0, 4)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.58fr]">
      <div className="space-y-6">
        <TrackingSearchForm key={urlOrderNumber} initialQuery={urlOrderNumber} />

        {foundOrder ? (
          <article className="rounded-lg border border-line bg-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase text-pulse">Don hang</p>
                <h2 className="mt-2 text-2xl font-semibold text-frost">{foundOrder.orderNumber}</h2>
                <p className="mt-1 text-sm text-steel">
                  Tao luc {new Date(foundOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(foundOrder.status)}>{foundOrder.status}</Badge>
                <Badge variant={foundOrder.paymentStatus === "paid" ? "mint" : "warning"}>
                  {foundOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {buildTrackingTimeline(foundOrder.status).map((step) => (
                <div
                  key={step.status}
                  className={`rounded-lg border p-3 ${
                    step.state === "current"
                      ? "border-pulse bg-pulse/12 text-frost"
                      : step.state === "done"
                        ? "border-pulse/30 bg-pulse/8 text-steel"
                        : "border-line bg-graphite text-steel"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        step.state === "upcoming" ? "bg-steel/40" : "bg-pulse"
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase">{step.state}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{step.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-line bg-graphite p-4">
              <h3 className="text-sm font-semibold text-frost">San pham</h3>
              <div className="mt-3 space-y-3 text-sm text-steel">
                {foundOrder.items.map((item) => {
                  const product = products.find((candidate) => candidate.id === item.productId);

                  return (
                    <div key={`${foundOrder.id}-${item.productId}`} className="flex justify-between gap-4">
                      <span>
                        {product?.name ?? item.productId} x {item.quantity}
                      </span>
                      <span className="font-semibold text-frost">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-semibold text-frost">
                <span>Tong don</span>
                <span>{formatCurrency(orderTotal(foundOrder))}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-graphite p-4">
                <h3 className="text-sm font-semibold text-frost">Dia chi giao hang</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{foundOrder.shippingAddress}</p>
              </div>
              <div className="rounded-lg border border-line bg-graphite p-4">
                <h3 className="text-sm font-semibold text-frost">Ghi chu</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{foundOrder.note || "Khong co ghi chu."}</p>
              </div>
            </div>
          </article>
        ) : urlOrderNumber ? (
          <EmptyState
            title="Khong tim thay don hang"
            description="Kiem tra lai ma don hang hoac dang nhap tai khoan da dat don."
            icon={PackageSearch}
          />
        ) : (
          <EmptyState
            title="Nhap ma don hang"
            description="Ban co the tim bang ma don sau khi dat hang thanh cong."
            icon={Truck}
          />
        )}
      </div>

      <aside className="rounded-lg border border-line bg-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-pulse">Gan day</p>
            <h2 className="mt-2 text-xl font-semibold text-frost">Don cua ban</h2>
          </div>
          <Link href="/tai-khoan" className="text-sm font-semibold text-pulse hover:text-frost">
            Tai khoan
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="mt-5 space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/theo-doi-don-hang?order=${order.orderNumber}`}
                className="block rounded-lg border border-line bg-graphite p-4 transition-colors hover:border-pulse/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-frost">{order.orderNumber}</span>
                  <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-steel">{formatCurrency(orderTotal(order))}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg border border-line bg-graphite p-4 text-sm leading-6 text-steel">
            Dang nhap tai khoan nguoi dung de xem nhanh cac don hang gan day.
          </p>
        )}
      </aside>
    </div>
  );
}

function TrackingSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();

    router.push(trimmed ? `/theo-doi-don-hang?order=${encodeURIComponent(trimmed)}` : "/theo-doi-don-hang");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-panel p-5 sm:p-6">
      <label>
        <span className="text-sm font-semibold text-steel">Ma don hang</span>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="PA-20260616-1001"
            className="min-h-11 flex-1 rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-pulse/70 bg-pulse px-4 text-sm font-semibold text-obsidian transition-colors hover:bg-[#9af6dc]"
          >
            <PackageSearch size={17} aria-hidden="true" />
            Tim don
          </button>
        </div>
      </label>
    </form>
  );
}
