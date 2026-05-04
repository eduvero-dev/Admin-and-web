import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFeedbacks } from "@/lib/api";
import FeedbackList from "./FeedbackList";

export default async function AdminFeedbacks() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const token = await auth().then(a => a.getToken());
  const data = await getFeedbacks(token, userId, 500);

  return (
    <main className="min-h-screen text-white p-8 lg:p-10 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-1">Latest</p>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            Teacher Feedback
          </h1>
          <p className="text-sm text-white/30 font-medium mt-1">Monitoring {data.total} submissions across the education network</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-[9px] font-black uppercase tracking-widest">Live Feed</span>
        </div>
      </header>

      <FeedbackList feedbacks={data.feedbacks} total={data.total} />
    </main>
  );
}
