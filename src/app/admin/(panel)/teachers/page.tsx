import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTeachers } from "@/lib/api";
import TeacherListContent from "./TeacherListContent";

export default async function AdminTeachers() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  try {
    const token = await auth().then(a => a.getToken());
    const data = await getTeachers(token, userId, 1000); // Fetch all teachers (high limit)

    return <TeacherListContent teachers={data.teachers} total={data.total} />;
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return (
      <TeacherListContent
        teachers={[]}
        total={0}
        error="Teachers could not be loaded. Please verify this production Clerk admin user exists in the backend and has admin access."
      />
    );
  }
}
