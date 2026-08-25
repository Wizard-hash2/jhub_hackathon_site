import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const authenticated = await isValidSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (request.nextUrl.pathname === "/adminlogin") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/adminlogin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/adminlogin"],
};
