import { describe, expect, it } from "vitest";
import { formatCurrency, slugify } from "@/lib/utils";

describe("utility helpers", () => {
  it("slugifies Vietnamese d with stroke characters", () => {
    expect(slugify("\u0111\u1ed3ng h\u1ed3 \u0110\u1eb9p")).toBe(
      "dong-ho-dep",
    );
  });

  it("formats Vietnamese currency", () => {
    expect(formatCurrency(12990000)).toMatch(/(\u20ab|VND)/);
  });
});
