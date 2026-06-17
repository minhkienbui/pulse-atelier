import { describe, expect, it } from "vitest";
import { accounts } from "@/data/accounts";
import { authenticateAccount, getAccountByRole } from "@/lib/auth";

describe("auth helpers", () => {
  it("authenticates a normal user account", () => {
    const result = authenticateAccount(accounts, "user@pulse.vn", "123456");

    expect(result).toMatchObject({
      email: "user@pulse.vn",
      role: "user",
      customerId: "cust-minh-anh",
    });
  });

  it("authenticates an admin account", () => {
    const result = authenticateAccount(accounts, "admin@pulse.vn", "admin123");

    expect(result).toMatchObject({
      email: "admin@pulse.vn",
      role: "admin",
      customerId: null,
    });
  });

  it("rejects invalid credentials", () => {
    expect(authenticateAccount(accounts, "user@pulse.vn", "wrong")).toBeNull();
    expect(authenticateAccount(accounts, "missing@pulse.vn", "123456")).toBeNull();
  });

  it("can find seeded account by role", () => {
    expect(getAccountByRole(accounts, "user")?.email).toBe("user@pulse.vn");
    expect(getAccountByRole(accounts, "admin")?.email).toBe("admin@pulse.vn");
  });
});
