import "server-only";

import { prisma } from "@/lib/prisma";
import { mapWatchToCard } from "./catalog";
import type { ProductCardDto } from "./types";

export async function getCustomerWishlist(
  userId: string
): Promise<ProductCardDto[]> {
  const items = await prisma.wishlist.findMany({
    where: { userId },
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
    orderBy: { createdAt: "desc" },
  });

  return items
    .filter((item) => item.watch.isActive)
    .map((item) => mapWatchToCard(item.watch));
}

export async function toggleWishlistItem(userId: string, watchId: string) {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_watchId: {
        userId,
        watchId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });

    return {
      isWishlisted: false,
    };
  }

  await prisma.wishlist.create({
    data: {
      userId,
      watchId,
    },
  });

  return {
    isWishlisted: true,
  };
}
