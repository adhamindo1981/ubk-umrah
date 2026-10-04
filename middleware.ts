import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for Strict Marketer Attribution & Isolation.
 * 1. When a pilgrim visits a marketer's page (/m/:code), it sets a persistent 1-year cookie (`ubk_pilgrim_marketer`).
 * 2. If that pilgrim later attempts to access the root homepage ("/"), the middleware automatically intercepts and
 *    redirects them back to their designated marketer's page (/m/:code), preventing bypass of the marketer.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
