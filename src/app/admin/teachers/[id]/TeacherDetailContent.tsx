"use client";

import { useState } from "react";
import Link from "next/link";
import { TeacherDetail } from "@/lib/types";
import PortfolioDetailPanel from "./PortfolioDetailPanel";

interface TeacherDetailContentProps {
  teacher: TeacherDetail;
}

export default function TeacherDetailContent({ teacher }: TeacherDetailContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "assessment" | "strategy" | "lesson" } | null>(null);

  const stats = [
    // ... stats logic remains same
    { label: "Assessments", value: teacher.total_assessments, icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { label: "Strategies", value: teacher.total_strategies, icon: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )},
    { label: "Lessons", value: teacher.total_lesson_plans, icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
    { label: "Results", value: teacher.total_assessment_results, icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { label: "Classes", value: teacher.total_class_periods, icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
  ];

  const filterItems = (items: any[], searchKey: string) => {
    if (!searchQuery) return items;
    return items?.filter(item => 
      item[searchKey]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAssessments = filterItems(teacher.assessments || [], 'name');
  const filteredStrategies = filterItems(teacher.strategies || [], 'title');
  const filteredLessons = filterItems(teacher.lesson_plans || [], 'title');
  const filteredClasses = filterItems(teacher.class_periods || [], 'name');

  return (
    <main className="min-h-screen bg-[#020508] text-white p-6 lg:p-10 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/teachers" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <svg className="w-4 h-4 rotate-180 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              {teacher.name}
            </h1>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">
              Teacher ID: {teacher.teacher_id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-cyan-500/50 transition-all">
              <svg className="w-4 h-4 text-white/30 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search teacher portfolio..."
                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-64 placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${teacher.deactivated ? 'border-red-500/20 bg-red-500/5 text-red-400' : 'border-green-500/20 bg-green-500/5 text-green-400'}`}>
              {teacher.deactivated ? 'Deactivated' : 'Active Account'}
            </div>
            {teacher.completed_onboarding && (
              <div className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                Onboarded
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">{stat.icon}</div>
            <div>
              <p className="text-2xl font-black text-white leading-tight">{stat.value}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Educator Profile
            </h2>
            <div className="space-y-6">
              {[
                { label: "Email Address", value: teacher.email },
                { label: "Account Role", value: `${teacher.school_type} Educator` },
                { label: "Experience", value: `${teacher.years_teaching} Years (${teacher.grade_level}th Grade)` },
                { label: "Current Location", value: `${teacher.state}, USA` },
                { label: "Active Curriculum", value: teacher.curriculum || "Standard Content" },
                { label: "System Onboarding", value: new Date(teacher.inserted_at).toLocaleDateString() }
              ].map((item, i) => (
                <div key={i} className="group">
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest group-hover:text-cyan-400/50 transition-colors">{item.label}</p>
                  <p className="text-sm font-bold text-white/80 mt-1.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-3">
             <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-white/40 hover:text-white hover:bg-white/10 uppercase tracking-widest transition-all">
              Reset Password Link
            </button>
            <button className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-black text-red-500/60 hover:text-red-400 hover:bg-red-500/20 uppercase tracking-widest transition-all">
              Deactivate Account
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              Assessments {searchQuery && <span className="text-[10px] lowercase font-normal ml-auto text-white/20">({filteredAssessments.length} found)</span>}
            </h2>
            <div className="space-y-4">
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((item) => (
                  <button 
                    key={item.assessment_id} 
                    onClick={() => setSelectedItem({ id: item.assessment_id.toString(), type: "assessment" })}
                    className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  >
                    <p className="text-sm font-bold text-white/60 group-hover:text-white leading-relaxed transition-colors pr-8">{item.name}</p>
                    <p className="text-[9px] text-white/10 font-black uppercase tracking-widest mt-2 group-hover:text-white/20">UUID: {item.assessment_id}</p>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-white/10 font-bold uppercase tracking-widest text-center py-8">No results found</p>
              )}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
              Strategies {searchQuery && <span className="text-[10px] lowercase font-normal ml-auto text-white/20">({filteredStrategies.length} found)</span>}
            </h2>
            <div className="space-y-4">
              {filteredStrategies.length > 0 ? (
                filteredStrategies.map((item) => (
                  <button 
                    key={item.strategy_id} 
                    onClick={() => setSelectedItem({ id: item.strategy_id.toString(), type: "strategy" })}
                    className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  >
                    <p className="text-sm font-bold text-white/60 group-hover:text-white leading-relaxed transition-colors pr-8">{item.title}</p>
                    <p className="text-[9px] text-white/10 font-black uppercase tracking-widest mt-2 group-hover:text-white/20">ID: {item.strategy_id}</p>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-white/10 font-bold uppercase tracking-widest text-center py-8">No results found</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
              Lesson Plans {searchQuery && <span className="text-[10px] lowercase font-normal ml-auto text-white/20">({filteredLessons.length} found)</span>}
            </h2>
            <div className="space-y-4">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((item) => (
                  <button 
                    key={item.lesson_plan_id} 
                    onClick={() => setSelectedItem({ id: item.lesson_plan_id.toString(), type: "lesson" })}
                    className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  >
                    <p className="text-sm font-bold text-white/60 group-hover:text-white leading-relaxed transition-colors pr-8">{item.title}</p>
                    <p className="text-[9px] text-white/10 font-black uppercase tracking-widest mt-2 group-hover:text-white/20">ID: {item.lesson_plan_id}</p>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-white/10 font-bold uppercase tracking-widest text-center py-8">No results found</p>
              )}
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-cyan-500/[0.02]">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Active Classes {searchQuery && <span className="text-[10px] lowercase font-normal ml-auto text-white/20">({filteredClasses.length} found)</span>}
            </h2>
            <div className="space-y-4">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((period) => (
                  <div key={period.class_id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-all group">
                    <div>
                      <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{period.name}</p>
                      <p className="text-[9px] text-white/20 font-black uppercase mt-1 tracking-wider">Class ID: {period.class_id}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-cyan-400/60 group-hover:text-cyan-400 transition-colors">{period.num_students}</span>
                      <p className="text-[8px] text-white/10 font-black uppercase tracking-tighter">Students</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/10 font-bold uppercase tracking-widest text-center py-8">No classes matching search</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Detail Slide-over Panel */}
      <PortfolioDetailPanel 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        itemId={selectedItem?.id || null}
        type={selectedItem?.type || null}
      />
    </main>
  );
}
