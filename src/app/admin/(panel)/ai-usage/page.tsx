import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAIUsage, getAIUsageCalls, getTeachers } from "@/lib/api";
import AIUsageClient from "./AIUsageClient";

interface SearchParams {
  page?: string;
  tab?: string;
  limit?: string;
}

export default async function AIUsagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/admin");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/admin?error=unauthorized");

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const itemsPerPage = parseInt(params.limit || "10");
  const activeTab = (params.tab || "users") as "users" | "calls";
  const offset = (currentPage - 1) * itemsPerPage;

  let aiUsageData: import("@/lib/types").AIUsageResponse | undefined;
  let callsData: import("@/lib/types").AIUsageCallsResponse | undefined;
  let teachersData: import("@/lib/types").TeacherListResponse | undefined;

  try {
    const token = await auth().then(a => a.getToken());

    // Fetch data based on active tab to optimize API calls
    if (activeTab === "users") {
      const [usageRes, teachersRes] = await Promise.all([
        getAIUsage(token, userId, itemsPerPage, offset),
        getTeachers(token, userId, 1000, 0),
      ]);
      aiUsageData = usageRes;
      teachersData = teachersRes;
    } else {
      const [callsRes, teachersRes] = await Promise.all([
        getAIUsageCalls(token, userId, itemsPerPage, offset),
        getTeachers(token, userId, 1000, 0),
      ]);
      callsData = callsRes;
      teachersData = teachersRes;
    }
  } catch (error) {
    console.error("Failed to fetch AI usage data:", error);
  }

  return (
    <main className="min-h-screen text-white font-sans">
      <div className="px-8 py-10 space-y-10">

        {/* Page Title */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Analytics</p>
            <h2 className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">AI Usage Statistics</h2>
            <p className="text-xs text-white/30 mt-1">Monitor token consumption across all teachers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[9px] font-black uppercase tracking-widest">Live Data</span>
            </div>
          </div>
        </div>

        {/* Client Component with Server-Side Pagination */}
        <AIUsageClient
          aiUsageData={aiUsageData}
          callsData={callsData}
          teachersData={teachersData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          activeTab={activeTab}
        />

      </div>
    </main>
  );
}
