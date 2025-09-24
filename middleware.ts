// Temporarily disable middleware to fix redirect loop
// This will be re-enabled once the NEXTAUTH_URL environment variable is properly configured

export { default } from "next-auth/middleware"

export const config = {
  // Only protect specific routes that require authentication
  matcher: [
    "/create/:path*",
    "/gallery/:path*", 
    "/settings/:path*"
  ]
}