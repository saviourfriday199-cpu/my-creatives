import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Edge middleware: a cheap gate that redirects unauthenticated visitors away
 * from protected pages by checking for the presence of a session cookie. It
 * does NOT validate the session (no DB at the edge, and better-sqlite3 can't run
 * there) — real authentication and authorization happen in the server
 * components and route handlers via getCurrentUser()/requireRole().
 */
const PROTECTED = ["/dashboard", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!needsAuth) return NextResponse.next();

  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
