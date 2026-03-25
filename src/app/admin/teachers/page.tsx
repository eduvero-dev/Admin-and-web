import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminTeachers() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  return (
    <main className="min-h-screen bg-[#050a0f] text-white p-8">
      <header className="flex items-center justify-between mb-12">
        <h1 className="text-xl font-bold">Teacher Management</h1>
        <Link href="/admin/dashboard" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest">
          Back to Dashboard
        </Link>
      </header>
      
      <div className="glass-card p-12 rounded-[2.5rem] text-center">
        <p className="text-white/40 font-medium">Teacher list and management interface coming soon.</p>
      </div>
    </main>
  );
}
