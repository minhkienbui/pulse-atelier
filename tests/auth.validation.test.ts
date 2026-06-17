import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/auth/validation";

describe("auth validation", () => {
  it("normalizes register email and trims optional profile fields", () => {
    const result = registerSchema.parse({
      name: "  Lam Hoang Minh  ",
      email: "  MINH@TEMPUS.VN ",
      password: "securepass123",
      phone: "  ",
      address: "  88 Dong Khoi  ",
    });

    expect(result).toEqual({
      name: "Lam Hoang Minh",
      email: "minh@tempus.vn",
      password: "securepass123",
      phone: undefined,
      address: "88 Dong Khoi",
    });
  });

  it("rejects weak passwords during registration", () => {
    const result = registerSchema.safeParse({
      name: "Minh",
      email: "minh@tempus.vn",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("accepts login with normalized email but requires a password", () => {
    expect(
      loginSchema.parse({
        email: "  MINH@TEMPUS.VN ",
        password: "x",
      }).email
    ).toBe("minh@tempus.vn");

    expect(
      loginSchema.safeParse({
        email: "minh@tempus.vn",
        password: "",
      }).success
    ).toBe(false);
  });
});
