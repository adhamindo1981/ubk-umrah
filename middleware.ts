import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "ubk-umrah-secret-production-auth-key-2026";

/**
 * Next.js Edge Middleware for Strict Marketer Attribution & Isolation.
 * - Pilgrims / External Visitors: Locked to their marketer and auto-redirected to /m/:code.
 * - Admins & Marketers (Internal Team): 100% UNRESTRICTED. Can freely inspect any marketer page and visit the main homepage.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current user is logged in (Admin or Marketer)
  const token = await getToken({ req: request, secret });
  const isInternalUser = token?.role === "ADMIN" || token?.role === "MARKETER";

  // Admins and Marketers have full unrestricted access to everything
  if (isInternalUser) {
    return NextResponse.next();
  }

  // 1. Marketer Marketing Page: /m/[code]
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

  // 2. Marketer Recruitment Page with ref: /mitra?ref=CODE
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

  // 3. Main Landing Homepage: "/"
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
