// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
 
export default clerkMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: [
    "/api/feeds",
    "/feed/(.*)", // Allow access to feed pages
  ],
});
 
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};