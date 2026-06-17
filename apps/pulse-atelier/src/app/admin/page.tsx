"use client";

import Link from "next/link";
import { Activity, CircleDollarSign, Repeat2, ShoppingCart } from "lucide-react";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminShell } from "@/components/layout/AdminShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { customers } from "@/data/customers";
import {
  getCustomerLifetimeStats,
  getLowStockProducts,
  getOrderCountByStatus,
  getRevenueTotal,
  getTopProducts,
} from "@/lib/admin";
import { formatCurrency } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";
import type { Order, Product, SupportTicket } from "@/types/domain";

function orderTotal(order: Order) {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export default function AdminDashboardPage() {
  const products = useAdminStore((state) => state.products);
  const orders = useAdminStore((state) => state.orders);
  const tickets = useAdminStore((state) => state.tickets);
  const revenue = getRevenueTotal(orders);
  const counts = getOrderCountByStatus(orders);
  const lifetimeStats = getCustomerLifetimeStats(customers, orders);
  const lowStockProducts = getLowStockProducts(products);
  const topProducts = getTopProducts(products, 5);
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;
  const conversion = orders.length > 0 ? Math.round((paidOrders / orders.length) * 100) : 0;
  const recentOrders = [...orders]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);
  const supportQueue = tickets
    .filter((ticket) => ticket.status !== "resolved")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);

  const orderColumns: AdminColumn<Order>[] = [
    { header: "Don", cell: (order) => <span className="font-semibold text-frost">{order.orderNumber}</span> },
    {
      header: "Khach",
      cell: (order) => customers.find((customer) => customer.id === order.customerId)?.name ?? order.customerId,
    },
    { header: "Trang thai", cell: (order) => <AdminStatusPill status={order.status} /> },
    { header: "Thanh toan", cell: (order) => <AdminStatusPill status={order.paymentStatus} /> },
    { header: "Tong", cell: (order) => <span className="font-semibold text-frost">{formatCurrency(orderTotal(order))}</span> },
  ];
  const ticketColumns: AdminColumn<SupportTicket>[] = [
    { header: "Ticket", cell: (ticket) => <span className="font-semibold text-frost">{ticket.id}</span> },
    { header: "Chu de", cell: (ticket) => ticket.subject },
    { header: "Uu tien", cell: (ticket) => ticket.priority },
    { header: "Trang thai", cell: (ticket) => <AdminStatusPill status={ticket.status} /> },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Operations"
        title="Tong quan admin"
        description="Dashboard cho doanh thu, don hang, khach hang quay lai, ton kho va hang doi ho tro."
        action={
          <Link
            href="/"
            className="inline-flex min-h-10 items-center rounded-lg border border-line bg-panel-soft px-3 text-sm font-semibold text-steel transition-colors hover:text-frost"
          >
            Storefront
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Doanh thu paid" value={formatCurrency(revenue)} detail="Tu don da thanh toan" icon={CircleDollarSign} />
        <MetricCard label="Don hang" value={orders.length} detail={`${counts.pending} dang cho`} icon={ShoppingCart} />
        <MetricCard label="Conversion" value={`${conversion}%`} detail={`${paidOrders}/${orders.length} paid`} icon={Activity} />
        <MetricCard label="Returning" value={lifetimeStats.returningCustomers} detail={`${lifetimeStats.vipCustomers} VIP`} icon={Repeat2} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-lg border border-line bg-panel p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-frost">Low-stock panel</h2>
              <p className="mt-1 text-sm text-steel">San pham cham nguong can nhap lai.</p>
            </div>
            <Link href="/admin/kho" className="text-sm font-semibold text-pulse hover:text-frost">
              Mo kho
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product: Product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-graphite p-3">
                  <div>
                    <p className="font-semibold text-frost">{product.name}</p>
                    <p className="mt-1 text-xs text-steel">Nguong {product.lowStockThreshold}</p>
                  </div>
                  <span className="text-sm font-semibold text-warning">{product.stock} con</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-line bg-graphite p-4 text-sm text-steel">
                Chua co SKU nao cham nguong canh bao.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-frost">Top products</h2>
          <div className="mt-5 grid gap-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg border border-line bg-graphite p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-pulse/25 bg-pulse/10 text-sm font-semibold text-pulse">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-frost">{product.name}</p>
                  <p className="mt-1 text-xs text-steel">{formatCurrency(product.price)}</p>
                </div>
                <span className="text-sm font-semibold text-frost">{product.soldCount} sold</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminDataTable
          title="Recent orders"
          description="Nhung don moi nhat theo thoi gian tao."
          rows={recentOrders}
          columns={orderColumns}
          getRowKey={(order) => order.id}
        />
        <AdminDataTable
          title="Support queue"
          description="Ticket dang mo hoac dang xu ly."
          rows={supportQueue}
          columns={ticketColumns}
          getRowKey={(ticket) => ticket.id}
        />
      </div>
    </AdminShell>
  );
}
