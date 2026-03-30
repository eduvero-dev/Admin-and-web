import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getTeacherById } from "@/lib/api";
import TeacherDetailContent from "./TeacherDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTeacherDetail({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const { id } = await params;
  const token = await auth().then(a => a.getToken());
  
  let teacher;
  try {
    teacher = await getTeacherById(token, userId, id);
  } catch (error) {
    console.error("Failed to fetch teacher details:", error);
    return notFound();
  }

  return <TeacherDetailContent teacher={teacher} />;
}
