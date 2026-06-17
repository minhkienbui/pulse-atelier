import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Vui lòng kiểm tra lại thông tin đăng ký.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, address } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        phone,
        address,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        message: "Đăng ký thành công!",
        user,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      {
        message: "Có lỗi xảy ra trong quá trình đăng ký.",
      },
      { status: 500 }
    );
  }
}
