import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFreshAdminToken } from "@/lib/admin-auth";
import { getReferralDraws } from "@/lib/api";
import ReferralDrawsClient from "./ReferralDrawsClient";

export default async function ReferralDrawsPage() {
  const authState = await auth();
  if (!authState.userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(authState.userId);
  if ((user.publicMetadata as { role?: string })?.role !== "admin") {
    redirect("/admin?error=unauthorized");
  }

  let data;
  let error = "";
  try {
    data = await getReferralDraws(await getFreshAdminToken(authState));
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Failed to load referral draws.";
  }

  return <ReferralDrawsClient data={data} error={error} />;
}
