import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getDashboardAnalytics, getFeedbacks } from "@/lib/api";

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

  // Fetch real-time analytics
  let analytics: import("@/lib/types").DashboardAnalytics | undefined;
  let feedbackData: import("@/lib/types").FeedbackResponse | undefined;

  try {
    const token = await auth().then(a => a.getToken());
    analytics = await getDashboardAnalytics(token);
    feedbackData = await getFeedbacks(token, 5); // Just get the last 5 for dashboard
    console.log("Feedback Data:", feedbackData);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "Admin";

  const metrics = [
    { label: "Total Teachers", value: analytics?.overview.total_teachers ?? 0, color: "text-cyan-400" },
    { label: "Total Assessments", value: analytics?.overview.total_assessments ?? 0, color: "text-white" },
    { label: "Results Submitted", value: analytics?.overview.total_assessment_results ?? 0, color: "text-white" },
    { label: "Total Strategies", value: analytics?.overview.total_strategies ?? 0, color: "text-white" },
    { label: "Lesson Plans", value: analytics?.overview.total_lesson_plans ?? 0, color: "text-white" },
    { label: "Feedbacks", value: analytics?.overview.total_feedbacks ?? 0, color: "text-white" },
    { label: "Class Periods", value: analytics?.overview.total_class_periods ?? 0, color: "text-white" },
    { label: "Friendships", value: analytics?.overview.total_friendships ?? 0, color: "text-white" },
    { label: "Chat Messages", value: analytics?.overview.total_chat_messages ?? 0, color: "text-white" },
  ];

  // Prepare breakdown data
  const teachersByState = Object.entries(analytics?.teachers_by_state ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const assessmentsBySubject = Object.entries(analytics?.assessments_by_subject ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const schoolTypes = Object.entries(analytics?.teachers_by_school_type ?? {});
  const totalSchoolTypes = schoolTypes.reduce((acc, curr) => acc + curr[1], 0);

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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="glass-card p-6 rounded-3xl">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">{metric.label}</p>
            <p className={`text-4xl font-black ${metric.color}`}>{metric.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 text-center lg:text-left">
        {/* Teachers by State */}
        <div className="glass-card p-8 rounded-[2.5rem]">
          <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
            Top Teacher Locations
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Global States</span>
          </h2>
          <div className="space-y-6">
            {teachersByState.map(([state, count], idx) => {
              const percentage = (count / (analytics?.overview.total_teachers ?? 1)) * 100;
              return (
                <div key={state} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/70">{state}</span>
                    <span className="text-cyan-400">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/40 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Subjects */}
        <div className="glass-card p-8 rounded-[2.5rem]">
          <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
            Popular Subjects
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Content Metrics</span>
          </h2>
          <div className="space-y-4">
            {assessmentsBySubject.map(([subject, count]) => (
              <div key={subject} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-sm font-bold capitalize">{subject}</span>
                </div>
                <span className="text-xs font-black text-white/50 bg-white/5 px-2.5 py-1 rounded-lg">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* School Types Breakdown */}
        <div className="glass-card p-8 rounded-[2.5rem]">
          <h2 className="text-lg font-bold mb-6">School Types</h2>
          <div className="flex flex-col gap-6">
            {schoolTypes.map(([type, count]) => {
              const percentage = totalSchoolTypes > 0 ? (count / totalSchoolTypes) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                      <span className="text-white/40">{type}</span>
                      <span className="text-white/60">{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full">
                      <div className="h-full bg-white/20 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Feedbacks Highlights */}
        <div className="glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Feedbacks</h2>
            <Link href="/admin/feedbacks" className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {feedbackData?.feedbacks?.map((fb) => (
              <div key={fb.feedback_id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-white/90">{fb.teacher_name}</p>
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                    {new Date(fb.inserted_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed line-clamp-1">
                  {fb.details}
                </p>
              </div>
            ))}
            {(!feedbackData?.feedbacks || feedbackData.feedbacks.length === 0) && (
              <p className="text-[11px] text-white/20 text-center py-4">No recent feedbacks found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 glass-card p-8 rounded-[2.5rem]">
        <h2 className="text-lg font-bold mb-6">Growth & Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between py-6 border-b border-white/5 md:border-b-0 md:border-r md:pr-8">
            <div>
              <p className="text-sm font-bold">New Teacher Signups</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{analytics?.recent_signups ?? 0} signups in the last window</p>
            </div>
            <Link href="/admin/teachers" className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-all">
              VIEW LOG
            </Link>
          </div>
          <div className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm font-bold">System Health</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                Active connections stable ({analytics?.overview.total_class_periods ?? 0} class sessions)
              </p>
            </div>
            <Link href="/admin/logs" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
              SYSTEM STAT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
