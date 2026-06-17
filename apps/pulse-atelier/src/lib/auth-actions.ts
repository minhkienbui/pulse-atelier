"use server";

import { db } from "./db";

export async function loginAction(email: string, password: string) {
  try {
    const account = await db.account.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!account || account.password !== password) {
      return { ok: false as const, error: "Email hoặc mật khẩu không đúng." };
    }

    return {
      ok: true as const,
      user: {
        id: account.id,
        email: account.email,
        role: account.role as "user" | "admin",
        name: account.name,
        customerId: account.customerId,
        phone: account.phone || "",
        address: account.address || "",
        createdAt: account.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Login action error:", err);
    return { ok: false as const, error: "Đã xảy ra lỗi khi đăng nhập." };
  }
}

export async function registerAction(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}) {
  try {
    const emailNormalized = input.email.trim().toLowerCase();
    const existing = await db.account.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return { ok: false as const, error: "Email này đã được sử dụng." };
    }

    // Create linked Customer record
    const customer = await db.customer.create({
      data: {
        name: input.name,
        email: emailNormalized,
        phone: input.phone,
        address: input.address,
        segment: "New",
        lifetimeSpend: 0.0,
        wishlistProductIds: [],
      },
    });

    // Create Account linked to Customer
    const account = await db.account.create({
      data: {
        email: emailNormalized,
        password: input.password,
        name: input.name,
        role: "user",
        customerId: customer.id,
        phone: input.phone,
        address: input.address,
      },
    });

    return {
      ok: true as const,
      user: {
        id: account.id,
        email: account.email,
        role: account.role as "user" | "admin",
        name: account.name,
        customerId: account.customerId,
        phone: account.phone || "",
        address: account.address || "",
        createdAt: account.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Register action error:", err);
    return { ok: false as const, error: "Đã xảy ra lỗi khi đăng ký tài khoản." };
  }
}
