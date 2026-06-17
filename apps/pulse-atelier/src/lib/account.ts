import type { Customer, Order, Product, SupportTicket } from "@/types/domain";

export interface AccountSnapshotInput {
  customerId: string | null;
  customers: Customer[];
  orders: Order[];
  products: Product[];
  tickets: SupportTicket[];
  wishlistProductIds: string[];
  comparedProductIds: string[];
}

export interface AccountSnapshot {
  customer: Customer | null;
  orders: Order[];
  wishlistProducts: Product[];
  comparedProducts: Product[];
  ownedDevices: Product[];
  supportTickets: SupportTicket[];
}

export function buildAccountSnapshot(_input: AccountSnapshotInput): AccountSnapshot {
  const customer = _input.customers.find((item) => item.id === _input.customerId) ?? null;

  if (!customer) {
    return {
      customer: null,
      orders: [],
      wishlistProducts: [],
      comparedProducts: [],
      ownedDevices: [],
      supportTickets: [],
    };
  }

  const customerOrders = _input.orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const wishlistIds = _input.wishlistProductIds.length > 0 ? _input.wishlistProductIds : customer.wishlistProductIds;
  const resolveProducts = (ids: string[]) =>
    ids
      .map((id) => _input.products.find((product) => product.id === id && product.status === "active"))
      .filter((product): product is Product => Boolean(product));
  const ownedDeviceIds = new Set<string>();

  for (const order of customerOrders.filter((order) => order.status === "completed")) {
    for (const item of order.items) {
      ownedDeviceIds.add(item.productId);
    }
  }

  return {
    customer,
    orders: customerOrders,
    wishlistProducts: resolveProducts(wishlistIds),
    comparedProducts: resolveProducts(_input.comparedProductIds),
    ownedDevices: resolveProducts([...ownedDeviceIds]),
    supportTickets: _input.tickets
      .filter((ticket) => ticket.customerId === customer.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}
