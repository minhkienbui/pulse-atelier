import type { Customer, Order, OrderStatus, Product } from "@/types/domain";

export function getRevenueTotal(_orders: Order[]) {
  return _orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce(
      (total, order) =>
        total + order.items.reduce((orderTotal, item) => orderTotal + item.quantity * item.unitPrice, 0),
      0,
    );
}

export function getOrderCountByStatus(_orders: Order[]): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    packed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const order of _orders) {
    counts[order.status] += 1;
  }

  return counts;
}

export function getLowStockProducts(_products: Product[]) {
  return _products
    .filter((product) => product.stock <= product.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock);
}

export function getTopProducts(_products: Product[], _limit = 5) {
  return [..._products]
    .filter((product) => product.status === "active")
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, _limit);
}

export interface CustomerLifetimeStats {
  totalLifetimeSpend: number;
  averageLifetimeSpend: number;
  vipCustomers: number;
  returningCustomers: number;
}

export function getCustomerLifetimeStats(_customers: Customer[], _orders: Order[]): CustomerLifetimeStats {
  const totalLifetimeSpend = _customers.reduce((total, customer) => total + customer.lifetimeSpend, 0);
  const orderCounts = new Map<string, number>();

  for (const order of _orders) {
    orderCounts.set(order.customerId, (orderCounts.get(order.customerId) ?? 0) + 1);
  }

  return {
    totalLifetimeSpend,
    averageLifetimeSpend: _customers.length > 0 ? Math.round(totalLifetimeSpend / _customers.length) : 0,
    vipCustomers: _customers.filter((customer) => customer.segment === "VIP").length,
    returningCustomers: _customers.filter((customer) => (orderCounts.get(customer.id) ?? 0) > 1).length,
  };
}
