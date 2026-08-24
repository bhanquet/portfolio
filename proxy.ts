import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { jwtVerify } from "jose";

/**
 * In-memory rate limiters.
 * Sufficient for a single-instance deployment.
 * For multi-instance / serverless production, switch to RateLimiterRedis.
 */
const limiters = {
  general: new RateLimiterMemory({
    keyPrefix: "general",
    points: 120,
    duration: 60 * 15, // 120 requests per 15 minutes
  }),
  auth: new RateLimiterMemory({
    keyPrefix: "auth",
    points: 10,
    duration: 60 * 15, // 10 attempts per 15 minutes
  }),
  api: new RateLimiterMemory({
    keyPrefix: "api",
    points: 60,
    duration: 60, // 60 requests per minute
  }),
  contact: new RateLimiterMemory({
    keyPrefix: "contact",
    points: 3,
    duration: 60 * 60, // 3 contact submissions per hour
  }),
};

const ADMIN_PATH_PREFIX = "/blog/manage";
const SIGNIN_PATH_PREFIX = "/auth/signin/";

function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_PATH_PREFIX ||
    pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)
  );
}

function isSignInPath(pathname: string): boolean {
  return pathname.startsWith(SIGNIN_PATH_PREFIX);
}

function getClientIp(request: NextRequest): string {
  // `NextRequest.ip` was removed in Next 15+, so we derive the client IP from
  // proxy-supplied headers. We must NOT trust the client-supplied *prefix* of
  // X-Forwarded-For (an attacker could spoof it to bypass the rate limiters).
  // Instead we rely on the value our trusted reverse proxy controls:
  //   - X-Real-IP: set by the proxy to the real client IP, or
  //   - the rightmost X-Forwarded-For hop, which the proxy appends for the
  //     direct client (so it cannot be forged by the client).
  // This assumes a reverse proxy (e.g. nginx/Caddy/Traefik) sits in front of
  // the app and rewrites these headers.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return "unknown";
}

async function isSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Enforce HTTPS in production behind a reverse proxy
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. Rate limiting
  try {
    await limiters.general.consume(ip, 1);

    if (isSignInPath(pathname)) {
      await limiters.auth.consume(ip, 1);
    }

    if (request.method === "POST" || pathname.startsWith("/api/")) {
      await limiters.api.consume(ip, 1);
    }

    // The contact form is a Server Action submitted via POST to the home page.
    // Server Action requests carry the `Next-Action` header, so we can target
    // the contact submission precisely instead of a non-existent /api/contact.
    if (
      pathname === "/" &&
      request.method === "POST" &&
      request.headers.get("Next-Action")
    ) {
      await limiters.contact.consume(ip, 1);
    }
  } catch {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 3. Admin route protection
  if (isAdminPath(pathname)) {
    const sessionToken = request.cookies.get("session")?.value;
    if (!(await isSessionValid(sessionToken))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 4. Security headers + CSP
  const response = NextResponse.next();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
