import Link from "next/link";
import { products } from "@/data/products";
import type { Order } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface OrderHistoryProps {
  orders: Order[];
}

function orderTotal(order: Order) {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

function statusVariant(status: Order["status"]) {
  if (status === "completed") return "mint";
  if (status === "cancelled") return "danger";
  if (status === "pending") return "warning";
  return "violet";
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-pulse">Order history</p>
          <h2 className="mt-2 text-xl font-semibold text-frost">Don hang gan day</h2>
        </div>
        <Link href="/san-pham" className="text-sm font-semibold text-pulse hover:text-frost">
          Mua them
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-lg border border-line bg-graphite p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-frost">{order.orderNumber}</h3>
                <p className="mt-1 text-xs text-steel">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                <Badge variant={order.paymentStatus === "paid" ? "mint" : "warning"}>{order.paymentStatus}</Badge>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-steel">
              {order.items.map((item) => {
                const product = products.find((candidate) => candidate.id === item.productId);

                return (
                  <div key={`${order.id}-${item.productId}`} className="flex justify-between gap-4">
                    <span>{product?.name ?? item.productId} x {item.quantity}</span>
                    <span className="font-semibold text-frost">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm font-semibold text-frost">
              <div className="flex items-center gap-4">
                <span>Tong don</span>
                <span>{formatCurrency(orderTotal(order))}</span>
              </div>
              <Link href={`/theo-doi-don-hang?order=${order.orderNumber}`} className="text-sm font-semibold text-pulse hover:text-frost">
                Theo doi
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
