import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFeedbacks } from "@/lib/api";

export default async function AdminFeedbacks() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const token = await auth().then(a => a.getToken());
  const data = await getFeedbacks(token, 500);
  console.log("Feedback Data:", data);

  return (
    <main className="min-h-screen bg-[#050a0f] text-white p-8 font-sans">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Full Feedback History</h1>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            {data.total} Total
          </span>
        </div>
        <Link href="/admin/dashboard" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">
          Back to Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.feedbacks.map((fb) => (
          <div key={fb.feedback_id} className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white/90">{fb.teacher_name}</h3>
                  <p className="text-[10px] text-white/30 font-medium">{fb.teacher_email}</p>
                </div>
                <div className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-widest bg-cyan-400/5 px-2 py-1 rounded-md border border-cyan-400/10">
                  {new Date(fb.inserted_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {fb.details}
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">ID: {fb.feedback_id.slice(0, 8)}...</span>
              <button className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Mark as Resolved</button>
            </div>
          </div>
        ))}
        {data.feedbacks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-white/20 font-medium">No feedback entries available in the system yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
