import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFreshAdminToken } from "@/lib/admin-auth";
import { getReferralDraw, getReferralDrawAudit } from "@/lib/api";
import ReferralDrawDetailClient from "./ReferralDrawDetailClient";

export default async function ReferralDrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authState = await auth();
  if (!authState.userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(authState.userId);
  if ((user.publicMetadata as { role?: string })?.role !== "admin") {
    redirect("/admin?error=unauthorized");
  }

  const { id } = await params;
  let draw;
  let audit: import("@/lib/types").AdminReferralDrawAuditEvent[] = [];
  let error = "";
  try {
    const token = await getFreshAdminToken(authState);
    [draw, audit] = await Promise.all([
      getReferralDraw(token, id),
      getReferralDrawAudit(token, id),
    ]);
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Failed to load referral draw.";
  }

  return <ReferralDrawDetailClient draw={draw} audit={audit} error={error} />;
}
