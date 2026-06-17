"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { toggleWishlistItem } from "@/data/wishlist";

export async function toggleWishlistAction(watchId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "Vui lòng đăng nhập.",
    };
  }

  const result = await toggleWishlistItem(session.user.id, watchId);

  revalidatePath("/wishlist");
  revalidatePath("/tai-khoan");

  return {
    ok: true,
    ...result,
  };
}
