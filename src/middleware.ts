import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = req.nextUrl;

  // Allow next-auth internal requests
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect root path to dashboard or home based on auth status
  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/home", req.url));
  }

  // If user is NOT signed in and trying to access a protected route
  if (!token && pathname !== "/login") {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If user IS signed in and trying to access login
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Pass current pathname to layout via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     * - /home (marketing landing page)
     * - /login (sign-in page)
     * - /signup (registration page)
     * - /portal (client facing routes)
     * - /api/auth (NextAuth endpoints)
     * - /api/signup (Registration endpoint)
     * - Static files (_next, favicons, etc.)
     */
    "/((?!login|signup|portal|api/auth|api/signup|api/create-subscription|api/admin|home|_next/static|_next/image|favicon.ico).*)",
  ],
};
