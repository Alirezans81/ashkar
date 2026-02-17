import { NextRequest, NextResponse } from "next/server";

// Simple middleware that doesn't use Prisma, authentication will be handled in the pages/api routes
export async function proxy(request: NextRequest) {
  // Allow access to login page and API login endpoint without authentication
  if (
    request.nextUrl.pathname.startsWith("/admin/login") ||
    request.nextUrl.pathname.startsWith("/api/admin/login") ||
    request.nextUrl.pathname.startsWith("/api/admin/check-auth")
  ) {
    return NextResponse.next();
  }

  // For admin routes, check if we have a session cookie
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    // Check if we have a session cookie
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // Redirect to login if no token exists
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // We can't verify the token in edge runtime due to Prisma dependency,
    // so we'll let the page handle the verification
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Apply middleware to admin routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/admin/:path*",
  ],
};
