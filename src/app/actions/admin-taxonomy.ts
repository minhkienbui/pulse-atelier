"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  adminBrandFormSchema,
  adminCategoryFormSchema,
} from "@/lib/admin/validation";
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

function optionalId(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : null;
}

export async function createAdminBrandAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const parsed = adminBrandFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logo: formData.get("logo"),
    country: formData.get("country"),
    foundedYear: formData.get("foundedYear"),
    description: formData.get("description"),
  });

  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.brand.create({
    data: {
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      logo: data.logo,
      country: data.country,
      foundedYear: data.foundedYear,
      description: data.description,
    },
  });

  revalidatePath("/admin/thuong-hieu");
  revalidatePath("/admin/san-pham");
  revalidatePath("/thuong-hieu");
  revalidatePath("/bo-suu-tap");
}

export async function updateAdminBrandAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const brandId = optionalId(formData.get("brandId"));
  if (!brandId) return;

  const parsed = adminBrandFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logo: formData.get("logo"),
    country: formData.get("country"),
    foundedYear: formData.get("foundedYear"),
    description: formData.get("description"),
  });

  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.brand.update({
    where: { id: brandId },
    data: {
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      logo: data.logo,
      country: data.country,
      foundedYear: data.foundedYear,
      description: data.description,
    },
  });

  revalidatePath("/admin/thuong-hieu");
  revalidatePath("/admin/san-pham");
  revalidatePath("/thuong-hieu");
  revalidatePath("/bo-suu-tap");
}

export async function setAdminBrandActiveAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const brandId = optionalId(formData.get("brandId"));
  const isActive = formData.get("isActive") === "true";

  if (!brandId) return;

  await prisma.brand.update({
    where: { id: brandId },
    data: { isActive },
  });

  revalidatePath("/admin/thuong-hieu");
  revalidatePath("/admin/san-pham");
  revalidatePath("/thuong-hieu");
  revalidatePath("/bo-suu-tap");
}

export async function createAdminCategoryAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const parsed = adminCategoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      description: data.description,
      image: data.image,
    },
  });

  revalidatePath("/admin/danh-muc");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}

export async function updateAdminCategoryAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const categoryId = optionalId(formData.get("categoryId"));
  if (!categoryId) return;

  const parsed = adminCategoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
  });

  if (!parsed.success) return;

  const data = parsed.data;

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      description: data.description,
      image: data.image,
    },
  });

  revalidatePath("/admin/danh-muc");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}

export async function setAdminCategoryActiveAction(
  formData: FormData
): Promise<void> {
  await requireAdminAccess();

  const categoryId = optionalId(formData.get("categoryId"));
  const isActive = formData.get("isActive") === "true";

  if (!categoryId) return;

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
  });

  revalidatePath("/admin/danh-muc");
  revalidatePath("/admin/san-pham");
  revalidatePath("/bo-suu-tap");
}
