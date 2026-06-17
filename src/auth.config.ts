import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { loginSchema } from "@/lib/auth/validation";

function normalizeRole(role: unknown): Role {
  return role === "ADMIN" || role === "STAFF" || role === "CUSTOMER"
    ? role
    : "CUSTOMER";
}

export const authConfig = {
  trustHost:
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.NODE_ENV !== "production",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const [{ prisma }, { verifyPassword }] = await Promise.all([
          import("@/lib/prisma"),
          import("@/lib/auth/password"),
        ]);

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
          },
        });

        if (!user?.password) return null;

        const isPasswordValid = await verifyPassword(
          parsed.data.password,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = normalizeRole(user.role);
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = normalizeRole(token.role);
      }
      return session;
    },
  },
  pages: {
    signIn: "/dang-nhap",
  },
} satisfies NextAuthConfig;
