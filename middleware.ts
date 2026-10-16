import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/authSecret";

/**
 * In-memory sliding window Rate Limiter for Edge Middleware
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Evict stale entries when map grows
  if (rateLimitMap.size > 2000) {
    rateLimitMap.forEach((v, k) => {
      if (now > v.resetTime) rateLimitMap.delete(k);
    });
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (record.count >= limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, retryAfterSec: 0 };
}

/**
 * Next.js Edge Middleware for:
 * 1. Strict RBAC for /admin, /api/admin, /dashboard, /api/marketer
 * 2. Rate Limiting on sensitive endpoints (/api/auth/register, /api/orders, /api/payouts, login)
 * 3. CSRF & Origin Verification on Mutation Requests
 * 4. Marketer Attribution & Isolation for Pilgrims
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getAuthSecret();

  // Extract client IP address safely
  const clientIp =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // ---------------------------------------------------------------------------
  // 1. CSRF Protection for API Mutations (POST, PUT, PATCH, DELETE)
  // ---------------------------------------------------------------------------
  const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (pathname.startsWith("/api/") && mutationMethods.includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        const isAllowed =
          originUrl.host === host ||
          originUrl.host.endsWith(".vercel.app") ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1";

        if (!isAllowed) {
          return NextResponse.json(
            { error: "Permintaan ditolak: CSRF Origin Mismatch / تم رفض الطلب بسبب عدم تطابق المصدر" },
            { status: 403 }
          );
        }
      } catch (_) {
        return NextResponse.json({ error: "Invalid Origin header" }, { status: 400 });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Rate Limiting on Sensitive Public Endpoints
  // ---------------------------------------------------------------------------
  // A. Umrah Booking Registration (/api/orders) - Max 10 requests / 5 mins
  if (pathname === "/api/orders" && request.method === "POST") {
    const { allowed, retryAfterSec } = checkRateLimit(`order_${clientIp}`, 10, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan pendaftaran. Silakan tunggu beberapa saat lagi. / تم تجاوز معدل الطلبات المسموح به. يرجى الانتظار والمحاولة لاحقاً.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  // A2. Public Tabungan Umrah Calculator Lead Capture - Max 10 requests / 5 mins
  if (pathname === "/api/public/tabungan-lead" && request.method === "POST") {
    const { allowed, retryAfterSec } = checkRateLimit(`tabungan_${clientIp}`, 10, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak simulasi tabungan dari perangkat Anda. Silakan tunggu beberapa menit / يرجى الانتظار قليلاً قبل طلب محاكاة جديدة.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  // B. Marketer Registration (/api/auth/register) - Max 5 accounts / 15 mins
  if (pathname === "/api/auth/register" && request.method === "POST") {
    const { allowed, retryAfterSec } = checkRateLimit(`reg_${clientIp}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Batas pendaftaran tercapai dari alamat IP Anda. Silakan coba lagi nanti. / تم تجاوز الحد المسموح للتسجيل من هذا العنوان. يرجى المحاولة لاحقاً.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  // C. Auth Sign-in / Credentials - Max 15 attempts / 15 mins to prevent brute-force
  if (
    (pathname.startsWith("/api/auth/callback/credentials") ||
      (pathname === "/auth/signin" && request.method === "POST")) &&
    request.method === "POST"
  ) {
    const { allowed, retryAfterSec } = checkRateLimit(`login_${clientIp}`, 15, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan masuk yang gagal. Akun sementara dibatasi demi keamanan. / محاولات دخول كثيرة خاطئة. تم تقييد المحاولات مؤقتاً لحماية الحساب.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  // D. Payout Requests (/api/payouts) - Max 5 requests / 10 mins
  if (pathname === "/api/payouts" && request.method === "POST") {
    const { allowed, retryAfterSec } = checkRateLimit(`payout_${clientIp}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Batas pengajuan penarikan dana tercapai. Silakan coba lagi setelah beberapa menit. / تم تجاوز الحد المسموح لطلبات السحب.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  // Check user token for authenticated routes
  const token = await getToken({ req: request, secret });

  // ---------------------------------------------------------------------------
  // 3. Edge Protection for Admin Panel & Admin APIs
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Administrator yang berhak / غير مصرح بالوصول لمسارات الإدارة" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 4. Edge Protection for Marketer Dashboard & APIs
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/auth/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/marketer") || pathname.startsWith("/api/payouts")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized / غير مصرح بالدخول" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admins and Marketers have full unrestricted access to browse the rest of the site
  const isInternalUser = token?.role === "ADMIN" || token?.role === "MARKETER";
  if (isInternalUser) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 5. Marketer Attribution & Cookie Tracking for Visitors
  // ---------------------------------------------------------------------------
  // Marketer Marketing Page: /m/[code]
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

  // Marketer Recruitment Page with ref: /mitra?ref=CODE
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

  // Main Landing Homepage: "/"
  if (pathname === "/") {
    const savedMarketerCode = request.cookies.get("ubk_pilgrim_marketer")?.value;
    // If the visitor was previously introduced by a marketer, lock and bounce them to their marketer's page
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
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset directories (images, uploads)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
