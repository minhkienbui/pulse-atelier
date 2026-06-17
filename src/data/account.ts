import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CustomerAccountDto,
  UpdateCustomerProfileInput,
} from "./types";

function mapAccount(user: {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
  role: CustomerAccountDto["role"];
  createdAt: Date;
  _count: {
    orders: number;
    wishlists: number;
  };
}): CustomerAccountDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    orderCount: user._count.orders,
    wishlistCount: user._count.wishlists,
  };
}

export async function getCustomerAccount(
  userId: string
): Promise<CustomerAccountDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          wishlists: true,
        },
      },
    },
  });

  return user ? mapAccount(user) : null;
}

export async function updateCustomerProfile(
  userId: string,
  input: UpdateCustomerProfileInput
): Promise<CustomerAccountDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          wishlists: true,
        },
      },
    },
  });

  return mapAccount(user);
}
