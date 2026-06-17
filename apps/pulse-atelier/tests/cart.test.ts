import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { getSuggestedBundleProducts, resolveCartLines } from "@/lib/cart";

describe("cart helpers", () => {
  it("resolves cart items into products with line totals and ignores missing products", () => {
    const lines = resolveCartLines(
      [
        { productId: "prod-aura-watch-pro", quantity: 2 },
        { productId: "missing-product", quantity: 5 },
      ],
      products,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      productId: "prod-aura-watch-pro",
      quantity: 2,
      lineTotal: 25_980_000,
    });
  });

  it("suggests active bundled products that are not already in the cart", () => {
    const suggestions = getSuggestedBundleProducts(
      [
        { productId: "prod-aura-watch-pro", quantity: 1 },
        { productId: "prod-pulse-charge-duo", quantity: 1 },
      ],
      products,
      3,
    );

    expect(suggestions.map((product) => product.id)).toContain("prod-atelier-magnetic-band");
    expect(suggestions.map((product) => product.id)).not.toContain("prod-pulse-charge-duo");
  });
});
