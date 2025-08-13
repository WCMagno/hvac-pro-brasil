import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@/types"

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If user is not authenticated, redirect to sign in
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    const userRole = token.role as UserRole

    // Role-based access control
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (pathname.startsWith("/technician") && userRole !== "TECHNICIAN" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Allow access to the requested route
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}