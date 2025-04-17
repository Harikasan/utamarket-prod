import { NextResponse } from "next/server";

// List of protected routes that require authentication
const protectedRoutes = [
  "/account",
  "/orders",
  "/support",
  "/cart",
  "/checkout",
];

// List of auth routes (login/signup pages)
const authRoutes = ["/login", "/signup", "/reset-password"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the authentication status from cookies
  const authToken = await request.cookies.get("auth_token");
  const isAuthenticated = authToken?.value;

  // If trying to access protected route while not authenticated
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    // Redirect to login page with return URL
    return NextResponse.redirect(
      new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // If trying to access auth routes while already authenticated
  if (authRoutes.includes(pathname) && isAuthenticated) {
    // Redirect to account page or home
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Specify which routes the middleware should run on
  matcher: [
    /*
     * Match all protected routes:
     * - /account
     * - /orders
     * - /support
     * - /cart
     * - /checkout
     * Match all auth routes:
     * - /login
     * - /signup
     * - /reset-password
     */
    "/account/:path*",
    "/orders/:path*",
    "/support/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/login",
    "/signup",
    "/reset-password",
  ],
};
