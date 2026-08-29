import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFeedbacks } from "@/lib/api";
import FeedbackList from "./FeedbackList";

export default async function AdminFeedbacks() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  let data: import("@/lib/types").FeedbackResponse = {
    total: 0,
    limit: 500,
    offset: 0,
    feedbacks: [],
  };
  let error = "";

  try {
    const token = await auth().then(a => a.getToken());
    data = await getFeedbacks(token, userId, 500);
  } catch (e) {
    console.error("Failed to fetch feedbacks:", e);
    error = "Feedbacks could not be loaded. Please verify the backend is configured for the production Clerk instance.";
  }

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

      {error && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold bg-red-500/10 border-red-500/20 text-red-300">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <FeedbackList feedbacks={data.feedbacks} total={data.total} />
    </main>
  );
}
