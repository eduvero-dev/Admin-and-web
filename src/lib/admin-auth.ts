import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

type AuthState = Awaited<ReturnType<typeof auth>>;

export async function getFreshAdminToken(authState?: AuthState) {
  const state = authState ?? (await auth());
  if (!state.sessionId) return state.getToken();

  const client = await clerkClient();
  const token = await client.sessions.getToken(state.sessionId);
  return token.jwt;
}
