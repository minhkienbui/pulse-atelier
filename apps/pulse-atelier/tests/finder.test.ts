import { describe, expect, it } from "vitest";
import { recommendProductsForRhythm } from "@/lib/finder";

describe("Rhythm Finder", () => {
  it("recommends fitness devices with a reason", () => {
    const result = recommendProductsForRhythm("fitness");

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].reason.length).toBeGreaterThan(12);
    expect(result.some((item) => item.product.useCases.includes("fitness"))).toBe(
      true,
    );
  });
});
