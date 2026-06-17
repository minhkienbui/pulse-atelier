import { describe, expect, it } from "vitest";
import {
  adminBrandFormSchema,
  adminCategoryFormSchema,
  adminProductFormSchema,
  adminOrderQuerySchema,
  adminOrderStatusSchema,
} from "@/lib/admin/validation";

describe("admin validation", () => {
  it("accepts valid order status updates", () => {
    const result = adminOrderStatusSchema.parse({
      orderId: "order_123",
      status: "SHIPPING",
    });

    expect(result).toEqual({
      orderId: "order_123",
      status: "SHIPPING",
    });
  });

  it("rejects invalid order statuses", () => {
    const result = adminOrderStatusSchema.safeParse({
      orderId: "order_123",
      status: "REFUNDED",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes admin order query input", () => {
    const result = adminOrderQuerySchema.parse({
      q: "  tmp-001  ",
      status: "COMPLETED",
    });

    expect(result).toEqual({
      q: "tmp-001",
      status: "COMPLETED",
    });
  });

  it("drops empty admin order filters", () => {
    const result = adminOrderQuerySchema.parse({
      q: "   ",
      status: "",
    });

    expect(result).toEqual({
      q: undefined,
      status: undefined,
    });
  });
});

describe("admin product validation", () => {
  it("normalizes numeric form fields for product create/update", () => {
    const result = adminProductFormSchema.parse({
      name: "  Rolex Submariner  ",
      sku: "  rlx-sub-001 ",
      brandId: "brand_1",
      categoryId: "category_1",
      price: "285000000",
      originalPrice: "",
      stock: "5",
      warranty: "5",
      image: " https://images.unsplash.com/watch.jpg ",
      isFeatured: "on",
      isLimited: undefined,
    });

    expect(result).toMatchObject({
      name: "Rolex Submariner",
      sku: "rlx-sub-001",
      price: 285000000,
      originalPrice: undefined,
      stock: 5,
      warranty: 5,
      images: ["https://images.unsplash.com/watch.jpg"],
      isFeatured: true,
      isLimited: false,
    });
  });

  it("rejects invalid product price and stock", () => {
    const result = adminProductFormSchema.safeParse({
      name: "Rolex Submariner",
      sku: "rlx-sub-001",
      brandId: "brand_1",
      categoryId: "category_1",
      price: "-1",
      stock: "-2",
    });

    expect(result.success).toBe(false);
  });
});

describe("admin brand and category validation", () => {
  it("normalizes brand metadata", () => {
    const result = adminBrandFormSchema.parse({
      name: "  Patek Philippe ",
      slug: "",
      country: " Switzerland ",
      foundedYear: "1839",
      description: " Haute horlogerie ",
    });

    expect(result).toEqual({
      name: "Patek Philippe",
      slug: undefined,
      country: "Switzerland",
      foundedYear: 1839,
      description: "Haute horlogerie",
    });
  });

  it("normalizes category metadata", () => {
    const result = adminCategoryFormSchema.parse({
      name: " Đồng hồ nam ",
      slug: " ",
      description: "",
      image: " https://images.unsplash.com/category.jpg ",
    });

    expect(result).toEqual({
      name: "Đồng hồ nam",
      slug: undefined,
      description: undefined,
      image: "https://images.unsplash.com/category.jpg",
    });
  });
});
