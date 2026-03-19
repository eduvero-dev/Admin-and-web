import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function AdminDashboard() {
  // Server-side role check (second layer of security after proxy)
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/admin");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/admin?error=unauthorized");
  }

  const displayName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "Admin";

  return (
    <main className="min-h-screen bg-[#050a0f] text-white font-sans p-8">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <img src="/adaptive-icon.png" alt="Logo" className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              Welcome, {displayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">Admin</span>
          </div>
          <Link href="/" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
            Main Site
          </Link>
          <UserButton />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Total Assessments</p>
          <p className="text-4xl font-black text-cyan-400">24</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Active Students</p>
          <p className="text-4xl font-black text-white">1,204</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Completion Rate</p>
          <p className="text-4xl font-black text-white">92%</p>
        </div>
      </div>

      <div className="mt-12 glass-card p-8 rounded-[2.5rem]">
        <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div>
              <p className="text-sm font-bold">Grade 4 Algebra Mini-Assessment</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">12 new submissions</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">View</button>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div>
              <p className="text-sm font-bold">Physics Midterm Prep</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Updated by Dr. Smith</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">View</button>
          </div>
        </div>
      </div>
    </main>
  );
}
