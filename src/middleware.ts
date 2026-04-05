import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     * - /login (sign-in page)
     * - /api/auth (NextAuth endpoints)
     * - Static files (_next, favicons, etc.)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
