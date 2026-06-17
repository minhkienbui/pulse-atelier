import { z } from "zod";

export const checkoutItemSchema = z.object({
  watchId: z.string().min(1),
  quantity: z.number().int().min(1).max(5),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().max(120).toLowerCase(),
  customerPhone: z.string().trim().min(8).max(20),
  shippingAddress: z.string().trim().min(8).max(240),
  shippingCity: z.string().trim().min(2).max(80),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "VNPAY"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
