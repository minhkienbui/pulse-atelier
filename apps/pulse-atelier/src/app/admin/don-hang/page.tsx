"use client";

import { FormEvent, useMemo, useState } from "react";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { generateOrderNumber } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";
import { useOrderStore } from "@/stores/order-store";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/domain";

const statusOptions: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "packed",
  "shipping",
  "completed",
  "cancelled",
];
const updateStatuses: OrderStatus[] = ["pending", "confirmed", "packed", "shipping", "completed", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed"];
const paymentMethods: PaymentMethod[] = ["cod", "bank"];

interface OrderFormState {
  customerId: string;
  productId: string;
  quantity: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}

function orderTotal(order: Order) {
  return order.total ?? order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export default function AdminOrdersPage() {
  const orders = useAdminStore((state) => state.orders);
  const customers = useAdminStore((state) => state.customers);
  const products = useAdminStore((state) => state.products);
  const addOrder = useAdminStore((state) => state.addOrder);
  const updateOrder = useAdminStore((state) => state.updateOrder);
  const deleteOrder = useAdminStore((state) => state.deleteOrder);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const [form, setForm] = useState<OrderFormState>({
    customerId: customers[0]?.id ?? "",
    productId: products[0]?.id ?? "",
    quantity: "1",
    shippingAddress: customers[0]?.address ?? "",
    paymentMethod: "cod",
  });
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? orders[0];
  const filteredOrders = useMemo(
    () => orders.filter((order) => statusFilter === "all" || order.status === statusFilter),
    [orders, statusFilter],
  );

  const handleAddOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const product = products.find((candidate) => candidate.id === form.productId);
    const customer = customers.find((candidate) => candidate.id === form.customerId);

    if (!product || !customer) return;

    const quantity = Math.max(1, Number(form.quantity || 1));
    const orderNumber = generateOrderNumber();
    const subtotal = product.price * quantity;
    const shippingFee = subtotal >= 20_000_000 ? 0 : 45_000;

    const order: Order = {
      id: `order-${orderNumber.toLowerCase()}`,
      orderNumber,
      customerId: customer.id,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: form.paymentMethod,
      items: [{ productId: product.id, quantity, unitPrice: product.price }],
      shippingAddress: form.shippingAddress.trim() || customer.address,
      note: "Don tao tu admin.",
      createdAt: new Date().toISOString(),
      subtotal,
      discount: 0,
      shippingFee,
      total: subtotal + shippingFee,
    };

    addOrder(order);
    useOrderStore.getState().addOrder(order);
    setSelectedId(order.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedOrder) return;

    const nextOrder = orders.find((order) => order.id !== selectedOrder.id);
    deleteOrder(selectedOrder.id);
    useOrderStore.getState().deleteOrder(selectedOrder.id);
    setSelectedId(nextOrder?.id ?? "");
  };

  const columns: AdminColumn<Order>[] = [
    {
      header: "Don hang",
      cell: (order) => (
        <button type="button" onClick={() => setSelectedId(order.id)} className="font-semibold text-frost hover:text-pulse">
          {order.orderNumber}
        </button>
      ),
    },
    {
      header: "Khach",
      cell: (order) => customers.find((customer) => customer.id === order.customerId)?.name ?? order.customerId,
    },
    { header: "Status", cell: (order) => <AdminStatusPill status={order.status} /> },
    { header: "Payment", cell: (order) => <AdminStatusPill status={order.paymentStatus} /> },
    {
      header: "Tong",
      cell: (order) => <span className="font-semibold text-frost">{formatCurrency(orderTotal(order))}</span>,
    },
    { header: "Ngay", cell: (order) => new Date(order.createdAt).toLocaleDateString("vi-VN") },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Orders"
        title="Quan ly don hang"
        description="Loc trang thai, tao don thu cong, cap nhat tien trinh va xoa don khong hop le."
      />

      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-line bg-panel p-3">
        {statusOptions.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              statusFilter === status
                ? "border-pulse bg-pulse/12 text-pulse"
                : "border-line bg-graphite text-steel hover:border-pulse/50 hover:text-frost"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <AdminDataTable
          title="Order table"
          description={`${filteredOrders.length} don hang dang hien thi.`}
          rows={filteredOrders}
          columns={columns}
          getRowKey={(order) => order.id}
        />

        <div className="space-y-6">
          <AdminActionPanel title="Them don hang" description="Tao don thu cong cho khach hang da co ho so.">
            <form onSubmit={handleAddOrder} className="grid gap-4">
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Khach hang</span>
                <select
                  value={form.customerId}
                  onChange={(event) => {
                    const customer = customers.find((item) => item.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      customerId: event.target.value,
                      shippingAddress: customer?.address ?? current.shippingAddress,
                    }));
                  }}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">San pham</span>
                <select
                  value={form.productId}
                  onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase text-steel">So luong</span>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase text-steel">Thanh toan</span>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))
                    }
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none focus:border-pulse"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span className="text-xs font-semibold uppercase text-steel">Dia chi giao</span>
                <textarea
                  value={form.shippingAddress}
                  onChange={(event) => setForm((current) => ({ ...current, shippingAddress: event.target.value }))}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-line bg-graphite px-3 py-3 text-sm text-frost outline-none focus:border-pulse"
                />
              </label>
              <Button type="submit">Them don hang</Button>
            </form>
          </AdminActionPanel>

          {selectedOrder ? (
            <AdminActionPanel title="Order detail" description={selectedOrder.shippingAddress}>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => {
                  const product = products.find((candidate) => candidate.id === item.productId);

                  return (
                    <div
                      key={item.productId}
                      className="flex justify-between gap-3 rounded-lg border border-line bg-graphite p-3 text-sm"
                    >
                      <span className="text-steel">
                        {product?.name ?? item.productId} x {item.quantity}
                      </span>
                      <span className="font-semibold text-frost">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm leading-6 text-steel">{selectedOrder.note}</p>
              <div className="mt-5">
                <span className="text-xs font-semibold uppercase text-steel">Trang thai don</span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {updateStatuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.status === status ? "primary" : "secondary"}
                      onClick={() => {
                        updateOrder(selectedOrder.id, { status });
                        useOrderStore.getState().updateOrder(selectedOrder.id, { status });
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <span className="text-xs font-semibold uppercase text-steel">Thanh toan</span>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {paymentStatuses.map((paymentStatus) => (
                    <Button
                      key={paymentStatus}
                      size="sm"
                      variant={selectedOrder.paymentStatus === paymentStatus ? "primary" : "secondary"}
                      onClick={() => {
                        updateOrder(selectedOrder.id, { paymentStatus });
                        useOrderStore.getState().updateOrder(selectedOrder.id, { paymentStatus });
                      }}
                    >
                      {paymentStatus}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="mt-5 w-full" variant="danger" onClick={handleDeleteSelected}>
                Xoa don
              </Button>
            </AdminActionPanel>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
