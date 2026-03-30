"use client";

import { useState } from "react";
import Link from "next/link";
import { TeacherSummary } from "@/lib/types";

interface TeacherListContentProps {
  teachers: TeacherSummary[];
  total: number;
}

export default function TeacherListContent({ teachers, total }: TeacherListContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020508] text-white p-6 lg:p-10 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Teacher Directory
            </h1>
            <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-black text-cyan-400 uppercase tracking-widest">
              Live Database
            </div>
          </div>
          <p className="text-base text-white/40 font-medium">Monitoring {total} registered educators in the system</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-cyan-500/50 transition-all">
              <svg className="w-5 h-5 text-white/30 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search teachers by name or email..."
                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-72 placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Link href="/admin/dashboard" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
            <span>Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" /></svg>
          </Link>
        </div>
      </header>

      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-xs font-black text-white/30 uppercase tracking-widest">Educator</th>
                <th className="px-8 py-6 text-xs font-black text-white/30 uppercase tracking-widest">Contact Information</th>
                <th className="px-8 py-6 text-xs font-black text-white/30 uppercase tracking-widest">Registration Date</th>
                <th className="px-8 py-6 text-xs font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeachers.map((teacher) => {
                const initials = teacher.name ? teacher.name.split(' ').map(n => n[0]).join('') : '?';
                return (
                  <tr key={teacher.teacher_id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5 text-xs font-black text-white/40 uppercase group-hover:from-cyan-500/20 group-hover:to-cyan-500/5 group-hover:text-cyan-400 transition-all duration-300 shadow-lg">
                          {initials}
                        </div>
                        <span className="text-base font-bold text-white/80 group-hover:text-white transition-colors">
                          {teacher.name || "Anonymous User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-white/40 group-hover:text-white/70 transition-colors">
                        {teacher.email}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-white/20">
                        {new Date(teacher.inserted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/admin/teachers/${teacher.teacher_id}`}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-black text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                      >
                        Performance Stats
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredTeachers.length === 0 && (
            <div className="py-32 text-center bg-white/[0.01]">
              <svg className="w-12 h-12 text-white/5 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-sm text-white/10 font-black uppercase tracking-widest">No educators found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
