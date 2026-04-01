import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFeedbacks } from "@/lib/api";
import FeedbackList from "./FeedbackList";

export default async function AdminFeedbacks() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const token = await auth().then(a => a.getToken());
  const data = await getFeedbacks(token, userId, 500);
  
  return (
    <main className="min-h-screen bg-[#020508] text-white p-8 lg:p-12 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Teacher Feedback
            </h1>
            <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-black text-cyan-400 uppercase tracking-widest">
              Live Feed
            </div>
          </div>
          <p className="text-base text-white/30 font-medium">Monitoring {data.total} submissions across the education network</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
            <span>Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" /></svg>
          </Link>
        </div>
      </header>

      <FeedbackList feedbacks={data.feedbacks} total={data.total} />
    </main>
  );
}
