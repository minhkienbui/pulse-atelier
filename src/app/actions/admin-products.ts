"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminProductFormSchema } from "@/lib/admin/validation";
import { generateSlug } from "@/lib/utils";

function isAdminRole(role: unknown) {
  return role === "ADMIN" || role === "STAFF";
}

async function requireAdminAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/dang-nhap");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }
}

function productInputFromForm(formData: FormData) {
  return adminProductFormSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice"),
    stock: formData.get("stock"),
    movement: formData.get("movement"),
    caseMaterial: formData.get("caseMaterial"),
    dialColor: formData.get("dialColor"),
    waterResistance: formData.get("waterResistance"),
    caseSize: formData.get("caseSize"),
    strapMaterial: formData.get("strapMaterial"),
    warranty: formData.get("warranty"),
    description: formData.get("description"),
    image: formData.get("image"),
    isFeatured: formData.get("isFeatured") || undefined,
    isLimited: formData.get("isLimited") || undefined,
  });
}

function productSlug(name: string, sku: string) {
  return generateSlug(`${name}-${sku}`);
}

export async function createAdminProductAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const parsed = productInputFromForm(formData);
  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.watch.create({
    data: {
      sku: data.sku,
      name: data.name,
      slug: productSlug(data.name, data.sku),
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      stock: data.stock,
      images: data.images,
      movement: data.movement,
      caseMaterial: data.caseMaterial,
      dialColor: data.dialColor,
      waterResistance: data.waterResistance,
      caseSize: data.caseSize,
      strapMaterial: data.strapMaterial,
      warranty: data.warranty,
      isFeatured: data.isFeatured,
      isLimited: data.isLimited,
      brandId: data.brandId,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}

export async function updateAdminProductAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const productId = formData.get("productId");
  if (typeof productId !== "string" || productId.trim() === "") return;

  const parsed = productInputFromForm(formData);
  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.watch.update({
    where: {
      id: productId,
    },
    data: {
      sku: data.sku,
      name: data.name,
      slug: productSlug(data.name, data.sku),
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      stock: data.stock,
      images: data.images,
      movement: data.movement,
      caseMaterial: data.caseMaterial,
      dialColor: data.dialColor,
      waterResistance: data.waterResistance,
      caseSize: data.caseSize,
      strapMaterial: data.strapMaterial,
      warranty: data.warranty,
      isFeatured: data.isFeatured,
      isLimited: data.isLimited,
      brandId: data.brandId,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}

export async function setAdminProductActiveAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const productId = formData.get("productId");
  const isActive = formData.get("isActive") === "true";

  if (typeof productId !== "string" || productId.trim() === "") return;

  await prisma.watch.update({
    where: {
      id: productId,
    },
    data: {
      isActive,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}
