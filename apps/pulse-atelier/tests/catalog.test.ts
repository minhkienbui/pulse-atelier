import { describe, expect, it } from "vitest";
import { filterProducts, getProductBySlug, sortProducts } from "@/lib/catalog";
import { products } from "@/data/products";

describe("catalog helpers", () => {
  it("finds a product by slug", () => {
    expect(getProductBySlug("aura-watch-pro")).toMatchObject({
      name: "Aura Watch Pro",
    });
  });

  it("filters products by ecosystem and use case", () => {
    const result = filterProducts(products, {
      ecosystems: ["ios"],
      useCases: ["fitness"],
    });

    expect(result.map((product) => product.slug)).toContain("aura-watch-pro");
    expect(result.every((product) => product.ecosystems.includes("ios"))).toBe(
      true,
    );
  });

  it("sorts products by battery life descending", () => {
    const result = sortProducts(products, "battery");
    expect(result[0].batteryHours).toBeGreaterThanOrEqual(
      result[result.length - 1].batteryHours,
    );
  });
});
