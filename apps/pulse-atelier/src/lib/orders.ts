import type { Order, OrderItem, OrderStatus, PaymentMethod } from "@/types/domain";

export interface CreateOrderInput {
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: string;
  note: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

export interface TrackingStep {
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
  state: "done" | "current" | "upcoming";
}

const trackingStatuses: Array<Exclude<OrderStatus, "cancelled">> = [
  "pending",
  "confirmed",
  "packed",
  "shipping",
  "completed",
];

const trackingLabels: Record<Exclude<OrderStatus, "cancelled">, string> = {
  pending: "Da tiep nhan",
  confirmed: "Da xac nhan",
  packed: "Dang dong goi",
  shipping: "Dang giao",
  completed: "Hoan tat",
};

export function createOrderFromCheckout(input: CreateOrderInput): Order {
  return {
    id: `order-${input.orderNumber.toLowerCase()}`,
    orderNumber: input.orderNumber,
    customerId: input.customerId,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: input.paymentMethod,
    items: input.items.map((item) => ({ ...item })),
    shippingAddress: input.shippingAddress,
    note: input.note,
    createdAt: input.createdAt,
    subtotal: input.subtotal,
    discount: input.discount,
    shippingFee: input.shippingFee,
    total: input.total,
  };
}

export function mergeOrders(seedOrders: Order[], createdOrders: Order[]) {
  const seen = new Set<string>();
  const merged: Order[] = [];

  for (const order of [...createdOrders, ...seedOrders]) {
    if (seen.has(order.orderNumber)) {
      continue;
    }

    seen.add(order.orderNumber);
    merged.push(order);
  }

  return merged;
}

export function findOrderByNumber(orders: Order[], orderNumber: string) {
  const normalized = orderNumber.trim().toLowerCase();

  return orders.find((order) => order.orderNumber.toLowerCase() === normalized) ?? null;
}

export function buildTrackingTimeline(status: OrderStatus): TrackingStep[] {
  if (status === "cancelled") {
    return trackingStatuses.map((item, index) => ({
      status: item,
      label: trackingLabels[item],
      state: index === 0 ? "done" : "upcoming",
    }));
  }

  const currentIndex = trackingStatuses.indexOf(status);

  return trackingStatuses.map((item, index) => ({
    status: item,
    label: trackingLabels[item],
    state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
  }));
}

export function generateOrderNumber(date = new Date(), random = Math.random) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + random() * 9000);

  return `PA-${stamp}-${suffix}`;
}
