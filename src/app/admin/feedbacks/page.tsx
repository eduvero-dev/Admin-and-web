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
    <main className="min-h-screen bg-[#020508] text-white p-8 lg:p-12 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Teacher Feedback
            </h1>
            <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              Live Feed
            </div>
          </div>
          <p className="text-sm text-white/30 font-medium">Monitoring {data.total} submissions across the education network</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
            <span>Dashboard</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" /></svg>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.feedbacks.map((fb) => {
          const initials = fb.teacher_name ? fb.teacher_name.split(' ').map(n => n[0]).join('') : '?';

          return (
            <div key={fb.feedback_id} className="group relative glass-card p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[4rem] group-hover:bg-cyan-500/10 transition-colors" />

              <div className="relative space-y-6">
                <header className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5 text-xs font-black text-white/60 uppercase group-hover:from-cyan-500/20 group-hover:to-cyan-500/5 group-hover:text-cyan-400 transition-all duration-500">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90 truncate max-w-[120px]">{fb.teacher_name || "Anonymous User"}</h3>
                      <p className="text-[10px] text-white/30 font-medium truncate max-w-[140px]">{fb.teacher_email || "no-email@eduvero.id"}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/5 text-cyan-400`}>
                    Feedback
                  </div>
                </header>

                <div className="space-y-4">
                  <p className="text-[13px] text-white/60 leading-relaxed font-medium line-clamp-4 min-h-[4rem]">
                    {fb.details}
                  </p>
                  <div className="text-[9px] font-black text-white/10 group-hover:text-white/20 uppercase tracking-[0.2em] transition-colors">
                    ID: {fb.feedback_id.slice(0, 12)}
                  </div>
                </div>
              </div>

              <div className="relative mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(fb.inserted_at))}
                </span>
                <button className="text-[10px] font-black text-white/20 hover:text-cyan-400 uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg hover:bg-cyan-400/5 border border-transparent hover:border-cyan-400/20">
                  Resolve
                </button>
              </div>
            </div>
          );
        })}

        {data.feedbacks.length === 0 && (
          <div className="col-span-full py-32 text-center glass-card rounded-[3rem]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-white/20 font-black uppercase tracking-widest">No signals found in the network</p>
          </div>
        )}
      </div>
    </main>
  );
}
