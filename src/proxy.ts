import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/tai-khoan");
  const isAuthRoute =
    nextUrl.pathname === "/dang-nhap" || nextUrl.pathname === "/dang-ky";

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (isAccountRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/dang-nhap", nextUrl));
    }
    return;
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/dang-nhap", nextUrl));
    }
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return;
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*", "/tai-khoan/:path*", "/dang-nhap", "/dang-ky"],
};
