import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes requiring a valid Clerk session AND admin role
const isAdminRoute = createRouteMatcher([
  '/admin/dashboard(.*)',
  '/admin/settings(.*)',
  '/admin/analytics(.*)',
]);

// Routes requiring only a valid Clerk session (no role check)
const isProtectedRoute = createRouteMatcher([
  '/admin/dashboard(.*)',
  '/admin/settings(.*)',
  '/admin/analytics(.*)',
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Step 1: ensure user is authenticated (redirects to /admin if not)
    const { userId } = await auth.protect();

    // Step 2: check they have the "admin" role via publicMetadata
    if (isAdminRoute(req)) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = (user.publicMetadata as { role?: string })?.role;

        if (role !== "admin") {
          // Signed in but NOT an admin — send them back to the login page
          const loginUrl = new URL("/admin", req.url);
          loginUrl.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(loginUrl);
        }
      } catch {
        // If we can't verify, block access
        const loginUrl = new URL("/admin", req.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }
    }
  }
});

export default proxy;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
