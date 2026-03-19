import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/signout
 * Server-side sign-out endpoint.
 * Revokes the Clerk session (clears HttpOnly cookies) then redirects to /.
 * Used when we need a guaranteed sign-out from a synchronous context
 * (e.g., browser back button from the Access Denied screen).
 */
export async function GET(req: Request) {
  try {
    const { sessionId } = await auth();

    if (sessionId) {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    }
  } catch {
    // If no session or error, proceed to redirect anyway
  }

  // Clear localStorage is client-side only — handled by the popstate caller.
  // Redirect to the landing page with a full page load to reset all state.
  const homeUrl = new URL("/", req.url);
  return NextResponse.redirect(homeUrl, { status: 302 });
}
