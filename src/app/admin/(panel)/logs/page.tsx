import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";

export default async function AdminLogs() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  return (
    <main className="min-h-screen text-white p-8 font-sans">
      <header className="mb-12">
        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Audit</p>
        <h1 className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">System Logs</h1>
      </header>

      <div className="glass-card p-12 rounded-[2.5rem] border border-white/5 text-center">
        <ScrollText className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/40 font-medium">Detailed system activity and audit logs coming soon.</p>
      </div>
    </main>
  );
}
