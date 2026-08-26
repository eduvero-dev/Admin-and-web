import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganizations } from "@/lib/api";
import { OrganizationBillingSource, OrganizationLifecycleStatus } from "@/lib/types";
import OrganizationsClient from "./OrganizationsClient";

interface SearchParams {
  page?: string;
  search?: string;
  lifecycle_status?: OrganizationLifecycleStatus;
  billing_source?: OrganizationBillingSource;
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const authState = await auth();
  const { userId } = authState;
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  let data;
  let error = "";

  try {
    data = await getOrganizations(await authState.getToken(), userId, {
      limit,
      offset,
      search: params.search?.trim(),
      lifecycleStatus: params.lifecycle_status || "",
      billingSource: params.billing_source || "",
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load organizations.";
  }

  return (
    <OrganizationsClient
      data={data}
      error={error}
      currentPage={currentPage}
      search={params.search || ""}
      lifecycleStatus={params.lifecycle_status || ""}
      billingSource={params.billing_source || ""}
    />
  );
}
