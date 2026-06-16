"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AIUsageResponse, AIUsageCallsResponse, TeacherListResponse } from "@/lib/types";
import { Cpu, Zap, Clock, User, List, Users, Search, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface AIUsageClientProps {
  aiUsageData?: AIUsageResponse;
  callsData?: AIUsageCallsResponse;
  teachersData?: TeacherListResponse;
  currentPage: number;
  itemsPerPage: number;
  activeTab: "users" | "calls";
}

type SortField = "name" | "tokens" | "calls" | "date";
type SortOrder = "asc" | "desc";

export default function AIUsageClient({
  aiUsageData,
  callsData,
  teachersData,
  currentPage,
  itemsPerPage,
  activeTab: initialTab,
}: AIUsageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"users" | "calls">(initialTab);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce delay
  const [sortField, setSortField] = useState<SortField>("tokens");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedFeature, setSelectedFeature] = useState<string>("all");

  // Create a map of teacher_id to teacher details
  const teacherMap = new Map(
    teachersData?.teachers.map(t => [t.teacher_id, t]) || []
  );

  // Calculate total usage across all users
  const totalTokensUsed = aiUsageData?.users.reduce((sum, user) => sum + user.total_tokens, 0) || 0;
  const totalCalls = callsData?.total || aiUsageData?.users.reduce((sum, user) => sum + user.calls.length, 0) || 0;

  // Get most recent call timestamp
  const allCalls = callsData?.calls || aiUsageData?.users.flatMap(u => u.calls) || [];
  const mostRecentCall = allCalls.length > 0
    ? allCalls.sort((a, b) => new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime())[0]
    : null;

  // Get unique features for filter
  const uniqueFeatures = useMemo(() => {
    const features = new Set<string>();
    allCalls.forEach(call => features.add(call.feature_name));
    return Array.from(features).sort();
  }, [allCalls]);

  // Handle tab change with URL update
  const handleTabChange = (tab: "users" | "calls") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1"); // Reset to page 1 on tab change
    router.push(`/admin/ai-usage?${params.toString()}`);
  };

  // Handle page change with URL update
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("tab", activeTab);
    router.push(`/admin/ai-usage?${params.toString()}`);
  };

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
          <Cpu className="w-5 h-5 mb-3 text-cyan-400" />
          <p className="text-2xl font-black text-cyan-400">{totalTokensUsed.toLocaleString()}</p>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Total Tokens</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
          <Zap className="w-5 h-5 mb-3 text-blue-400" />
          <p className="text-2xl font-black text-blue-400">{totalCalls.toLocaleString()}</p>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">API Calls</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20">
          <User className="w-5 h-5 mb-3 text-violet-400" />
          <p className="text-2xl font-black text-violet-400">{aiUsageData?.users.length || 0}</p>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Active Users</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20">
          <Clock className="w-5 h-5 mb-3 text-pink-400" />
          <p className="text-2xl font-black text-pink-400">
            {mostRecentCall
              ? new Date(mostRecentCall.inserted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "N/A"}
          </p>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Last Activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5">
        <button
          onClick={() => handleTabChange("users")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "users" ? "text-cyan-400" : "text-white/30 hover:text-white/60"
          }`}
        >
          <Users className="w-4 h-4" />
          By User
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("calls")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "calls" ? "text-cyan-400" : "text-white/30 hover:text-white/60"
          }`}
        >
          <List className="w-4 h-4" />
          All Calls
          {activeTab === "calls" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder={activeTab === "users" ? "Search by teacher name or email..." : "Search by feature or teacher..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {/* Debounce Loading Indicator */}
            {searchQuery !== debouncedSearchQuery && searchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            )}
            {/* Clear Button */}
            {searchQuery && searchQuery === debouncedSearchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="appearance-none pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:border-cyan-500/50"
              >
                <option value="tokens" className="bg-[#050a0f]">Sort: Tokens</option>
                <option value="calls" className="bg-[#050a0f]">Sort: Calls</option>
                <option value="name" className="bg-[#050a0f]">Sort: Name</option>
                <option value="date" className="bg-[#050a0f]">Sort: Date</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Feature Filter */}
          {activeTab === "calls" && (
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all" className="bg-[#050a0f]">All Features</option>
                {uniqueFeatures.map(feature => (
                  <option key={feature} value={feature} className="bg-[#050a0f] capitalize">
                    {feature}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(debouncedSearchQuery || selectedFeature !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Active Filters:</span>
            {debouncedSearchQuery && (
              <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-[10px] font-bold flex items-center gap-1.5">
                Search: "{debouncedSearchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-cyan-300">✕</button>
              </span>
            )}
            {selectedFeature !== "all" && (
              <span className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 text-[10px] font-bold flex items-center gap-1.5 capitalize">
                {selectedFeature}
                <button onClick={() => setSelectedFeature("all")} className="hover:text-violet-300">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "users" ? (
        <UserBasedView
          aiUsageData={aiUsageData}
          teacherMap={teacherMap}
          searchQuery={debouncedSearchQuery}
          sortField={sortField}
          sortOrder={sortOrder}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      ) : (
        <CallsBasedView
          callsData={callsData}
          teacherMap={teacherMap}
          searchQuery={debouncedSearchQuery}
          sortField={sortField}
          sortOrder={sortOrder}
          selectedFeature={selectedFeature}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

interface UserBasedViewProps {
  aiUsageData?: AIUsageResponse;
  teacherMap: Map<string, any>;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function UserBasedView({
  aiUsageData,
  teacherMap,
  searchQuery,
  sortField,
  sortOrder,
  currentPage,
  itemsPerPage,
  onPageChange,
}: UserBasedViewProps) {
  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    if (!aiUsageData?.users) return [];

    let filtered = aiUsageData.users.filter(user => {
      if (!searchQuery) return true;
      const teacher = teacherMap.get(user.teacher_id);
      const searchLower = searchQuery.toLowerCase();
      return (
        teacher?.name.toLowerCase().includes(searchLower) ||
        teacher?.email.toLowerCase().includes(searchLower) ||
        user.teacher_id.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const teacherA = teacherMap.get(a.teacher_id);
      const teacherB = teacherMap.get(b.teacher_id);

      let comparison = 0;
      switch (sortField) {
        case "tokens":
          comparison = a.total_tokens - b.total_tokens;
          break;
        case "calls":
          comparison = a.calls.length - b.calls.length;
          break;
        case "name":
          comparison = (teacherA?.name || "").localeCompare(teacherB?.name || "");
          break;
        case "date":
          const dateA = a.calls[0]?.inserted_at || "";
          const dateB = b.calls[0]?.inserted_at || "";
          comparison = dateA.localeCompare(dateB);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [aiUsageData, teacherMap, searchQuery, sortField, sortOrder]);

  const displayUsers = searchQuery ? filteredAndSortedUsers : aiUsageData?.users || [];
  const totalItems = aiUsageData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Detailed Breakdown</p>
          <h3 className="text-lg font-black">Usage by Teacher</h3>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1.5 rounded-lg">
          {searchQuery ? `${filteredAndSortedUsers.length} filtered` : `${totalItems} total teachers`}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {displayUsers.length > 0 ? (
          displayUsers.map((user) => {
            const teacher = teacherMap.get(user.teacher_id);
            const avgTokensPerCall = user.calls.length > 0
              ? Math.round(user.total_tokens / user.calls.length)
              : 0;

            const featureCounts = user.calls.reduce((acc, call) => {
              acc[call.feature_name] = (acc[call.feature_name] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={user.teacher_id} className="px-8 py-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-bold text-white">
                        {teacher?.name || "Unknown Teacher"}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest">
                        {user.calls.length} calls
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{teacher?.email || user.teacher_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-cyan-400">{user.total_tokens.toLocaleString()}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">tokens</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Avg/Call</p>
                    <p className="text-sm font-black text-white">{avgTokensPerCall.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Features</p>
                    <p className="text-sm font-black text-white">{Object.keys(featureCounts).length}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Last Call</p>
                    <p className="text-sm font-black text-white">
                      {user.calls.length > 0
                        ? new Date(user.calls[0].inserted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Top Feature</p>
                    <p className="text-sm font-black text-white capitalize truncate">
                      {Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-2">Feature Usage</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(featureCounts).map(([feature, count]) => (
                      <div
                        key={feature}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <span className="text-[10px] font-bold text-white/60 capitalize">{feature}</span>
                        <span className="ml-2 text-[10px] font-black text-cyan-400">{count}×</span>
                      </div>
                    ))}
                  </div>
                </div>

                <details className="mt-4 group">
                  <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors flex items-center gap-2">
                    <span>View Recent Calls ({user.calls.length})</span>
                    <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {user.calls.slice(0, 10).map((call) => (
                      <div key={call.id} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60 font-bold capitalize">{call.feature_name}</span>
                          <span className="text-[9px] text-white/30 font-bold">
                            {new Date(call.inserted_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[9px]">
                          <span className="text-white/40">Model: <span className="text-white/60">{call.model_name}</span></span>
                          <span className="text-white/40">Tokens: <span className="text-cyan-400 font-black">{call.total_tokens.toLocaleString()}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })
        ) : (
          <div className="px-8 py-12 text-center">
            <Cpu className="w-12 h-12 mx-auto mb-4 text-white/10" />
            <p className="text-white/40 text-sm">
              {searchQuery ? `No results found for "${searchQuery}"` : "No AI usage data available"}
            </p>
          </div>
        )}
      </div>

      {/* Server-Side Pagination */}
      {!searchQuery && totalPages > 1 && (
        <ServerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

interface CallsBasedViewProps {
  callsData?: AIUsageCallsResponse;
  teacherMap: Map<string, any>;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  selectedFeature: string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function CallsBasedView({
  callsData,
  teacherMap,
  searchQuery,
  sortField,
  sortOrder,
  selectedFeature,
  currentPage,
  itemsPerPage,
  onPageChange,
}: CallsBasedViewProps) {
  // Client-side filtering and sorting
  const filteredAndSortedCalls = useMemo(() => {
    if (!callsData?.calls) return [];

    let filtered = callsData.calls.filter(call => {
      const teacher = teacherMap.get(call.teacher_id);
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        call.feature_name.toLowerCase().includes(searchLower) ||
        teacher?.name.toLowerCase().includes(searchLower) ||
        teacher?.email.toLowerCase().includes(searchLower) ||
        call.model_name.toLowerCase().includes(searchLower);

      const matchesFeature = selectedFeature === "all" || call.feature_name === selectedFeature;

      return matchesSearch && matchesFeature;
    });

    // Sort
    filtered.sort((a, b) => {
      const teacherA = teacherMap.get(a.teacher_id);
      const teacherB = teacherMap.get(b.teacher_id);

      let comparison = 0;
      switch (sortField) {
        case "tokens":
          comparison = a.total_tokens - b.total_tokens;
          break;
        case "name":
          comparison = (teacherA?.name || "").localeCompare(teacherB?.name || "");
          break;
        case "date":
          comparison = a.inserted_at.localeCompare(b.inserted_at);
          break;
        case "calls":
          comparison = a.id - b.id;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [callsData, teacherMap, searchQuery, sortField, sortOrder, selectedFeature]);

  const displayCalls = (searchQuery || selectedFeature !== "all") ? filteredAndSortedCalls : callsData?.calls || [];
  const totalItems = callsData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasFilters = searchQuery || selectedFeature !== "all";

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">All Activity</p>
          <h3 className="text-lg font-black">Recent API Calls</h3>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1.5 rounded-lg">
          {hasFilters ? `${filteredAndSortedCalls.length} filtered` : `${totalItems} total calls`}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {displayCalls.length > 0 ? (
          displayCalls.map((call) => {
            const teacher = teacherMap.get(call.teacher_id);
            return (
              <div key={call.id} className="px-8 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-white capitalize">{call.feature_name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest">
                        ID: {call.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 mb-2">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {teacher?.name || "Unknown"}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="truncate">{teacher?.email || call.teacher_id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-white/30">
                      <span>Model: <span className="text-white/50 font-bold">{call.model_name}</span></span>
                      <span className="text-white/10">|</span>
                      <span>Prompt: <span className="text-white/50 font-bold">{call.prompt_tokens.toLocaleString()}</span></span>
                      <span className="text-white/10">|</span>
                      <span>Completion: <span className="text-white/50 font-bold">{call.completion_tokens.toLocaleString()}</span></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-cyan-400">{call.total_tokens.toLocaleString()}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-2">tokens</p>
                    <p className="text-[9px] text-white/40 font-bold">
                      {new Date(call.inserted_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-8 py-12 text-center">
            <List className="w-12 h-12 mx-auto mb-4 text-white/10" />
            <p className="text-white/40 text-sm">
              {hasFilters ? "No calls match your filters" : "No API calls found"}
            </p>
          </div>
        )}
      </div>

      {/* Server-Side Pagination */}
      {!hasFilters && totalPages > 1 && (
        <ServerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function ServerPagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: ServerPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between">
      <p className="text-xs text-white/40 font-bold">
        Showing <span className="text-white">{startItem}-{endItem}</span> of{" "}
        <span className="text-white">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..." || page === currentPage}
            className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-black transition-all ${
              page === currentPage
                ? "bg-cyan-500 text-[#021a1d] shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : page === "..."
                ? "text-white/20 cursor-default"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
