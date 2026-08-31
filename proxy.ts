import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { jwtVerify } from "jose";

/**
 * Rate limiters kept for Vercel prod.
 * - auth: protects /auth/signin/[secret] against brute-force (bcrypt)
 * - contact: protects Server Action contact form (Resend cost + spam)
 * In-memory is per-instance on serverless; sufficient for a single-admin portfolio.
 */
const limiters = {
  auth: new RateLimiterMemory({
    keyPrefix: "auth",
    points: 10,
    duration: 60 * 15, // 10 attempts per 15 minutes
  }),
  contact: new RateLimiterMemory({
    keyPrefix: "contact",
    points: 3,
    duration: 60 * 60, // 3 submissions per hour
  }),
};

const ADMIN_PATH_PREFIX = "/blog/manage";
const SIGNIN_PATH_PREFIX = "/auth/signin/";

/** Returns true for /blog/manage and sub-routes. */
function isAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_PATH_PREFIX ||
    pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)
  );
}

/** Returns true for /auth/signin/[secret] routes. */
function isSignInPath(pathname: string): boolean {
  return pathname.startsWith(SIGNIN_PATH_PREFIX);
}

/**
 * Extracts client IP for rate limiting on Vercel.
 * Vercel sets x-forwarded-for with the real client as first hop.
 */
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Verifies the session JWT and checks admin role.
 * Mirrors lib/session.ts decrypt logic but edge-safe (no server-only).
 */
async function isAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return (payload as { userRole?: string }).userRole === "admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Rate limiting (429 on exceeded quota)
  try {
    if (isSignInPath(pathname)) {
      await limiters.auth.consume(ip, 1);
    }

    // Contact form is a Server Action on POST / with Next-Action header
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

  // 2. Admin route protection — redirect unauthenticated/non-admin to home
  if (isAdminPath(pathname)) {
    const sessionToken = request.cookies.get("session")?.value;
    if (!(await isAdminSession(sessionToken))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and image optimization routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
