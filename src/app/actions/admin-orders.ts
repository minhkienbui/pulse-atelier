"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminOrderStatusSchema } from "@/lib/admin/validation";

function isAdminRole(role: unknown) {
  return role === "ADMIN" || role === "STAFF";
}

export async function updateAdminOrderStatusAction(
  formData: FormData
): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  const parsed = adminOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  await prisma.order.update({
    where: {
      id: parsed.data.orderId,
    },
    data: {
      status: parsed.data.status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/don-hang");
  revalidatePath("/tai-khoan");
}
