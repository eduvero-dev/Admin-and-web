import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTeachers } from "@/lib/api";
import TeacherListContent from "./TeacherListContent";

export default async function AdminTeachers() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const token = await auth().then(a => a.getToken());
  const data = await getTeachers(token, userId, 100); // Get up to 100 for now
  
  return <TeacherListContent teachers={data.teachers} total={data.total} />;
}
