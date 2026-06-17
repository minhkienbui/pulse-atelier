import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapWatchToCard } from "./catalog";
import type {
  CartValidationItem,
  CartValidationResult,
  CreatePendingOrderInput,
  CustomerOrderDto,
  CustomerOrderItemDto,
} from "./types";

const orderInclude = {
  items: {
    include: {
      watch: {
        include: {
          brand: {
            select: {
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

function toVndInteger(value: number): number {
  return Math.round(value);
}

function compactCartItems(items: CartValidationItem[]): CartValidationItem[] {
  const quantityByWatchId = new Map<string, number>();

  for (const item of items) {
    quantityByWatchId.set(
      item.watchId,
      (quantityByWatchId.get(item.watchId) || 0) + item.quantity
    );
  }

  return Array.from(quantityByWatchId.entries()).map(([watchId, quantity]) => ({
    watchId,
    quantity,
  }));
}

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TMP-${datePart}-${randomPart}`;
}

function mapOrderItem(item: OrderWithItems["items"][number]): CustomerOrderItemDto {
  return {
    id: item.id,
    watchId: item.watchId,
    name: item.watch.name,
    slug: item.watch.slug,
    brand: item.watch.brand.name,
    image: item.watch.images[0] || null,
    quantity: item.quantity,
    price: toVndInteger(item.price),
    subtotal: toVndInteger(item.price * item.quantity),
  };
}

function mapOrder(order: OrderWithItems): CustomerOrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: toVndInteger(order.subtotal),
    discount: toVndInteger(order.discount),
    shippingFee: toVndInteger(order.shippingFee),
    total: toVndInteger(order.total),
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingEmail: order.shippingEmail,
    note: order.note,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(mapOrderItem),
  };
}

export async function validateCartItems(
  items: CartValidationItem[]
): Promise<CartValidationResult> {
  const compactedItems = compactCartItems(items).filter(
    (item) => item.watchId && Number.isInteger(item.quantity) && item.quantity > 0
  );
  const watchIds = compactedItems.map((item) => item.watchId);
  const watches = await prisma.watch.findMany({
    where: {
      id: { in: watchIds },
    },
    include: {
      brand: {
        select: {
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
  const watchesById = new Map(watches.map((watch) => [watch.id, watch]));
  const errors: Record<string, string> = {};
  const validatedItems = compactedItems.flatMap((item) => {
    const watch = watchesById.get(item.watchId);

    if (!watch || !watch.isActive) {
      errors[item.watchId] = "Sản phẩm không còn khả dụng.";
      return [];
    }

    if (watch.stock <= 0) {
      errors[item.watchId] = "Sản phẩm đã hết hàng.";
      return [];
    }

    if (item.quantity > watch.stock) {
      errors[item.watchId] = `Chỉ còn ${watch.stock} sản phẩm trong kho.`;
      return [];
    }

    const price = toVndInteger(watch.price);

    return [
      {
        watchId: item.watchId,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
        watch: mapWatchToCard(watch),
      },
    ];
  });
  const subtotal = validatedItems.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  return {
    items: validatedItems,
    subtotal,
    errors,
  };
}

export async function createPendingOrder(input: CreatePendingOrderInput) {
  const subtotal = input.items.reduce((total, item) => total + item.subtotal, 0);
  const discount = input.discount || 0;
  const shippingFee = input.shippingFee || 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        subtotal,
        discount,
        shippingFee,
        total,
        shippingName: input.customerName,
        shippingPhone: input.customerPhone,
        shippingEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        note: input.note,
        items: {
          create: input.items.map((item) => ({
            watchId: item.watchId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: orderInclude,
    });

    return mapOrder(order);
  });
}

export async function getCustomerOrders(
  userId: string
): Promise<CustomerOrderDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(mapOrder);
}

export async function getOrderForCustomer(
  orderId: string,
  userId: string
): Promise<CustomerOrderDto | null> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
  });

  return order ? mapOrder(order) : null;
}
