import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(emptyToUndefined, z.string().max(maxLength).optional());

const requiredMoney = z.coerce.number().finite().min(0);
const optionalMoney = z.preprocess(
  emptyToUndefined,
  z.coerce.number().finite().min(0).optional()
);
const requiredInteger = z.coerce.number().int().min(0);
const optionalInteger = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(0).optional()
);

const checkboxBoolean = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.undefined()])
  .transform((value) => value === true || value === "on" || value === "true");

export const adminOrderStatusValueSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
]);

export const adminOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1),
  status: adminOrderStatusValueSchema,
});

export const adminOrderQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  status: z.preprocess(
    emptyToUndefined,
    adminOrderStatusValueSchema.optional()
  ),
});

export const adminProductFormSchema = z
  .object({
    name: z.string().trim().min(2).max(180),
    sku: z.string().trim().min(2).max(80),
    brandId: z.string().trim().min(1),
    categoryId: z.string().trim().min(1),
    price: requiredMoney,
    originalPrice: optionalMoney,
    stock: requiredInteger,
    movement: optionalTrimmedString(80),
    caseMaterial: optionalTrimmedString(80),
    dialColor: optionalTrimmedString(80),
    waterResistance: optionalTrimmedString(80),
    caseSize: optionalTrimmedString(40),
    strapMaterial: optionalTrimmedString(80),
    warranty: optionalInteger,
    description: optionalTrimmedString(4000),
    image: optionalTrimmedString(500),
    isFeatured: checkboxBoolean,
    isLimited: checkboxBoolean,
  })
  .transform(({ image, ...data }) => ({
    ...data,
    images: image ? [image] : [],
  }));

export const adminProductQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  brandId: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
});

export const adminBrandFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: optionalTrimmedString(140),
  logo: optionalTrimmedString(500),
  country: optionalTrimmedString(80),
  foundedYear: optionalInteger,
  description: optionalTrimmedString(2000),
});

export const adminCategoryFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: optionalTrimmedString(140),
  description: optionalTrimmedString(2000),
  image: optionalTrimmedString(500),
});

export const adminTextQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
});
