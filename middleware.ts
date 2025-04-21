import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that are considered public
  const isPublicPath = path === "/login" || path === "/register" || path === "/auth-debug"

  // Check if user is logged in by looking for the token in cookies
  const hasUserCookie = request.cookies.has("pomodoro-auth")

  console.log(`Middleware: Path=${path}, Public=${isPublicPath}, HasCookie=${hasUserCookie}`)

  // Redirect logic
  if (isPublicPath && hasUserCookie) {
    // If user is logged in and trying to access a public path, redirect to home
    console.log("Middleware: Redirecting to home from public path")
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isPublicPath && !hasUserCookie && path !== "/api") {
    // If user is not logged in and trying to access a protected path, redirect to login
    // Skip API routes to avoid redirect loops
    if (!path.startsWith("/api")) {
      console.log("Middleware: Redirecting to login from protected path")
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
