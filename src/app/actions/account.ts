"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { updateCustomerProfile } from "@/data/account";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(240).optional(),
});

export async function updateProfileAction(formData: FormData): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return;
  }

  await updateCustomerProfile(session.user.id, parsed.data);
  revalidatePath("/tai-khoan");
}
