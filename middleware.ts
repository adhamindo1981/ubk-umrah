import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "ubk-umrah-secret-production-auth-key-2026";

/**
 * Next.js Edge Middleware for:
 * 1. Strict Role-Based Access Control (RBAC) at Edge for /admin and /dashboard
 * 2. Marketer Attribution & Isolation for Pilgrims
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current user is logged in
  const token = await getToken({ req: request, secret });

  // 1. Edge Protection for /admin: Strictly ADMIN role only
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Edge Protection for /dashboard: Strictly authenticated users only
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Admins and Marketers have full unrestricted access to browse the rest of the site
  const isInternalUser = token?.role === "ADMIN" || token?.role === "MARKETER";
  if (isInternalUser) {
    return NextResponse.next();
  }

  // 3. Marketer Marketing Page: /m/[code]
  const marketerMatch = pathname.match(/^\/m\/([A-Za-z0-9_-]+)/);
  if (marketerMatch) {
    const code = marketerMatch[1];
    const response = NextResponse.next();

    // Lock pilgrim to this marketer for 1 year
    response.cookies.set("ubk_pilgrim_marketer", code, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  }

  // 4. Marketer Recruitment Page with ref: /mitra?ref=CODE
  if (pathname === "/mitra") {
    const ref = request.nextUrl.searchParams.get("ref");
    if (ref && ref.trim() !== "") {
      const response = NextResponse.next();
      response.cookies.set("ubk_pilgrim_marketer", ref.trim(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: false,
      });
      return response;
    }
  }

  // 5. Main Landing Homepage: "/"
  if (pathname === "/") {
    const savedMarketerCode = request.cookies.get("ubk_pilgrim_marketer")?.value;
    // If the visitor was previously introduced by a marketer, lock and bounce them to their marketer's page!
    if (savedMarketerCode && savedMarketerCode.trim() !== "") {
      const redirectUrl = new URL(`/m/${savedMarketerCode.trim()}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match paths to apply middleware, excluding:
     * - api routes
     * - _next static files and images
     * - public assets (images, icons, uploads)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
