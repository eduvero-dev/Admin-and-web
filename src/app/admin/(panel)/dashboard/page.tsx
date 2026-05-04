import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardAnalytics, getFeedbacks } from "@/lib/api";
import {
  GraduationCap,
  ClipboardList,
  BarChart2,
  Lightbulb,
  BookOpen,
  MessageSquare,
  School,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  let analytics: import("@/lib/types").DashboardAnalytics | undefined;
  let feedbackData: import("@/lib/types").FeedbackResponse | undefined;

  try {
    const token = await auth().then(a => a.getToken());
    analytics = await getDashboardAnalytics(token, userId);
    feedbackData = await getFeedbacks(token, userId, 4);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "Admin";

  const metrics = [
    { label: "Teachers", value: analytics?.overview.total_teachers ?? 0, icon: GraduationCap, href: "/admin/teachers", color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/20", text: "text-cyan-400" },
    { label: "Assessments", value: analytics?.overview.total_assessments ?? 0, icon: ClipboardList, href: null, color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20", text: "text-blue-400" },
    { label: "Results", value: analytics?.overview.total_assessment_results ?? 0, icon: BarChart2, href: null, color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20", text: "text-indigo-400" },
    { label: "Strategies", value: analytics?.overview.total_strategies ?? 0, icon: Lightbulb, href: null, color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", text: "text-violet-400" },
    { label: "Lesson Plans", value: analytics?.overview.total_lesson_plans ?? 0, icon: BookOpen, href: null, color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/20", text: "text-purple-400" },
    { label: "Feedbacks", value: analytics?.overview.total_feedbacks ?? 0, icon: MessageSquare, href: "/admin/feedbacks", color: "from-pink-500/20 to-pink-500/5", border: "border-pink-500/20", text: "text-pink-400" },
    { label: "Class Periods", value: analytics?.overview.total_class_periods ?? 0, icon: School, href: null, color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", text: "text-amber-400" },
    { label: "Friendships", value: analytics?.overview.total_friendships ?? 0, icon: Users, href: null, color: "from-green-500/20 to-green-500/5", border: "border-green-500/20", text: "text-green-400" },
  ];

  const teachersByState = Object.entries(analytics?.teachers_by_state ?? {})
    .sort((a, b) => b[1] - a[1]).slice(0, 6);

  const assessmentsBySubject = Object.entries(analytics?.assessments_by_subject ?? {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  const schoolTypes = Object.entries(analytics?.teachers_by_school_type ?? {})
    .sort((a, b) => b[1] - a[1]);
  const totalSchoolTypes = schoolTypes.reduce((acc, curr) => acc + curr[1], 0);

  const subjectColors = [
    "from-cyan-500 to-blue-500",
    "from-blue-500 to-indigo-500",
    "from-indigo-500 to-violet-500",
    "from-violet-500 to-purple-500",
    "from-purple-500 to-pink-500",
  ];

  return (
    <main className="min-h-screen text-white font-sans">
      <div className="px-8 py-10 space-y-10">

        {/* Page Title */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Overview</p>
            <h2 className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-xs text-white/30 mt-1">Welcome back, {displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[9px] font-black uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const card = (
              <div className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${metric.color} border ${metric.border} hover:scale-[1.02] transition-transform cursor-default`}>
                <Icon className={`w-5 h-5 mb-3 ${metric.text}`} />
                <p className={`text-2xl font-black ${metric.text}`}>{metric.value.toLocaleString()}</p>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{metric.label}</p>
              </div>
            );
            return metric.href ? (
              <Link key={index} href={metric.href} className="hover:opacity-90 transition-opacity">{card}</Link>
            ) : (
              <div key={index}>{card}</div>
            );
          })}
        </div>

        {/* Row 2: Distribution + Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Teacher Distribution */}
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Geographic</p>
                <h3 className="text-lg font-black">Teacher Distribution</h3>
              </div>
              <Link href="/admin/teachers" className="text-[9px] font-black uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:border-cyan-500/40 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-10">
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                  {teachersByState.map(([state, count], idx) => {
                    const total = analytics?.overview.total_teachers ?? 1;
                    const radius = 45 - (idx * 7);
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - ((count / total) * circumference);
                    const colors = ["stroke-cyan-400", "stroke-blue-400", "stroke-indigo-400", "stroke-violet-400", "stroke-purple-400", "stroke-pink-400"];
                    return (
                      <circle key={state} cx="50" cy="50" r={radius} fill="transparent"
                        className={colors[idx % colors.length]}
                        strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black text-white">{analytics?.overview.total_teachers ?? 0}</p>
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Total</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {teachersByState.map(([state, count], idx) => {
                  const dotColors = ["bg-cyan-400", "bg-blue-400", "bg-indigo-400", "bg-violet-400", "bg-purple-400", "bg-pink-400"];
                  const pct = Math.round((count / (analytics?.overview.total_teachers ?? 1)) * 100);
                  return (
                    <div key={state} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                        <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors capitalize">{state}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${dotColors[idx % dotColors.length]}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-white/30 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Popular Subjects */}
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Content</p>
                <h3 className="text-lg font-black">Popular Subjects</h3>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1.5 rounded-lg">
                {analytics?.overview.total_assessments ?? 0} total
              </span>
            </div>
            <div className="space-y-5">
              {assessmentsBySubject.map(([subject, count], idx) => {
                const total = analytics?.overview.total_assessments ?? 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={subject} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-white/20 w-4">0{idx + 1}</span>
                        <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors capitalize">{subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/20">{pct}%</span>
                        <span className="text-xs font-black text-white/60">{count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${subjectColors[idx % subjectColors.length]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: School Types + Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* School Types */}
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <div className="mb-8">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Breakdown</p>
              <h3 className="text-lg font-black">School Types</h3>
            </div>
            <div className="space-y-4">
              {schoolTypes.map(([type, count], idx) => {
                const pct = totalSchoolTypes > 0 ? (count / totalSchoolTypes) * 100 : 0;
                const barColors = ["bg-cyan-400/60", "bg-blue-400/60", "bg-indigo-400/60", "bg-violet-400/60", "bg-purple-400/60", "bg-pink-400/60", "bg-amber-400/60"];
                return (
                  <div key={type} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white/70 transition-colors">{type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/20">{count}</span>
                        <span className="text-[10px] font-black text-white/40">{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Latest</p>
                <h3 className="text-lg font-black">Recent Feedbacks</h3>
              </div>
              <Link href="/admin/feedbacks" className="text-[9px] font-black uppercase tracking-widest text-pink-400/60 hover:text-pink-400 transition-colors border border-pink-500/20 px-3 py-1.5 rounded-lg hover:border-pink-500/40 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {feedbackData?.feedbacks?.map((fb) => (
                <div key={fb.feedback_id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{fb.teacher_name}</p>
                    <span className="text-[9px] text-white/20 font-bold">
                      {new Date(fb.inserted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-white/30 leading-relaxed line-clamp-1 flex-1">{fb.details}</p>
                    {fb.screenshot_urls?.length > 0 && (
                      <span className="shrink-0 text-[8px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        {fb.screenshot_urls.length} img
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!feedbackData?.feedbacks || feedbackData.feedbacks.length === 0) && (
                <p className="text-[11px] text-white/20 text-center py-8">No feedbacks yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Growth & Activity */}
        <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
            <Activity className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Platform</p>
              <h3 className="text-base font-black">Growth & Recent Activity</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="px-8 py-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-cyan-400">{analytics?.recent_signups ?? 0}</p>
                <p className="text-xs font-bold text-white/60 mt-0.5">Recent Signups</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">{analytics?.overview.total_teachers ?? 0} total teachers</p>
              </div>
              <Link href="/admin/teachers" className="shrink-0 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                All Teachers
              </Link>
            </div>
            <div className="px-8 py-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-green-400">{analytics?.overview.total_class_periods ?? 0}</p>
                <p className="text-xs font-bold text-white/60 mt-0.5">Active Classes</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">Stable connections</p>
              </div>
              <Link href="/admin/logs" className="shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                System Stats
              </Link>
            </div>
            <div className="px-8 py-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-pink-400">{analytics?.overview.total_feedbacks ?? 0}</p>
                <p className="text-xs font-bold text-white/60 mt-0.5">Total Feedbacks</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">From all teachers</p>
              </div>
              <Link href="/admin/feedbacks" className="shrink-0 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-black uppercase tracking-widest hover:bg-pink-500/20 transition-all flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Feedbacks
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
