import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || undefined)
    .optional();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).toLowerCase(),
  password: z.string().min(8).max(72),
  phone: optionalTrimmedString(20),
  address: optionalTrimmedString(240),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(120).toLowerCase(),
  password: z.string().min(1).max(72),
});
