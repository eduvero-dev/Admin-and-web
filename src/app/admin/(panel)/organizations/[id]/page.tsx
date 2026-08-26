import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getOrganizationById } from "@/lib/api";
import OrganizationDetailClient from "./OrganizationDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const authState = await auth();
  const { userId } = authState;
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  const { id } = await params;

  try {
    const organization = await getOrganizationById(await authState.getToken(), userId, id);
    return <OrganizationDetailClient initialOrganization={organization} />;
  } catch (error) {
    console.error("Failed to fetch organization:", error);
    return notFound();
  }
}
