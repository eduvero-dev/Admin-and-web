"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight, CheckSquare, Square, X, ChevronDown, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { TeacherSummary } from "@/lib/types";
import { updateTeacherPlan } from "./actions";

type Plan = "Freemium" | "Insight" | "Impact Pro";

interface TeacherListContentProps {
  teachers: TeacherSummary[];
  total: number;
  error?: string;
}

export default function TeacherListContent({ teachers, total, error }: TeacherListContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPlan, setBulkPlan] = useState<Plan>("Freemium");
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(() =>
    teachers.filter(t =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [teachers, searchQuery]);

  const allSelected = filtered.length > 0 && filtered.every(t => selected.has(t.teacher_id));
  const someSelected = filtered.some(t => selected.has(t.teacher_id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      filtered.forEach(t => next.delete(t.teacher_id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach(t => next.add(t.teacher_id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  const applyBulkPlan = async () => {
    if (selected.size === 0) return;
    setUpdating(true);
    setResult(null);
    try {
      const ids = Array.from(selected);
      await updateTeacherPlan(ids, bulkPlan);
      setResult({ type: "success", text: `Plan updated to "${bulkPlan}" for ${ids.length} teacher${ids.length > 1 ? "s" : ""}.` });
      clearSelection();
    } catch (err: any) {
      setResult({ type: "error", text: err.message || "Failed to update plans." });
    } finally {
      setUpdating(false);
    }
  };

  const plans: Plan[] = ["Freemium", "Insight", "Impact Pro"];
  const planColors: Record<Plan, string> = {
    Freemium: "text-white/60",
    Insight: "text-cyan-400",
    "Impact Pro": "text-purple-400",
  };

  return (
    <main className="min-h-screen text-white p-6 lg:p-10 font-sans selection:bg-cyan-500/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Directory</p>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            All Teachers
          </h1>
          <p className="text-sm text-white/40 font-medium mt-1">Complete directory of all registered educators — {total} total</p>
        </div>

        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-cyan-500/50 transition-all">
            <Search className="w-4 h-4 text-white/30 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-64 placeholder:text-white/20 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Result toast */}
      {error && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold bg-red-500/10 border-red-500/20 text-red-300">
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {result && (
        <div className={`mb-4 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold ${result.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {result.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{result.text}</span>
          <button onClick={() => setResult(null)}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex-wrap">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-white/40 font-bold">Set plan to:</span>

          {/* Plan picker */}
          <div className="relative">
            <button
              onClick={() => setPlanDropdownOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black hover:bg-white/10 transition-all"
            >
              <span className={planColors[bulkPlan]}>{bulkPlan}</span>
              <ChevronDown className="w-3 h-3 text-white/30" />
            </button>
            {planDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 glass-card rounded-xl border border-white/10 overflow-hidden min-w-[140px] shadow-xl">
                {plans.map(p => (
                  <button
                    key={p}
                    onClick={() => { setBulkPlan(p); setPlanDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-black hover:bg-white/5 transition-colors ${p === bulkPlan ? "bg-white/[0.03]" : ""} ${planColors[p]}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={applyBulkPlan}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs font-black text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
            Apply
          </button>

          <button onClick={clearSelection} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      )}

      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 w-12">
                  <button onClick={toggleAll} className="flex items-center justify-center text-white/30 hover:text-white transition-colors">
                    {allSelected
                      ? <CheckSquare className="w-4 h-4 text-cyan-400" />
                      : someSelected
                        ? <CheckSquare className="w-4 h-4 text-white/40" />
                        : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
                <th className="px-4 py-5 text-xs font-black text-white/30 uppercase tracking-widest">Educator</th>
                <th className="px-8 py-5 text-xs font-black text-white/30 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-xs font-black text-white/30 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-xs font-black text-white/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((teacher) => {
                const isSelected = selected.has(teacher.teacher_id);
                const initials = teacher.name ? teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?';
                return (
                  <tr
                    key={teacher.teacher_id}
                    className={`group hover:bg-white/[0.02] transition-colors ${isSelected ? "bg-purple-500/[0.03] border-l-2 border-l-purple-500/40" : ""}`}
                  >
                    <td className="px-6 py-5 w-12">
                      <button onClick={() => toggleOne(teacher.teacher_id)} className="flex items-center justify-center text-white/20 hover:text-white transition-colors">
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-purple-400" />
                          : <Square className="w-4 h-4" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-xs font-black uppercase transition-all duration-300 shrink-0 ${isSelected ? "from-purple-500/20 to-purple-500/5 bg-gradient-to-br text-purple-400 border-purple-500/20" : "bg-gradient-to-br from-white/10 to-white/5 text-white/40 border-white/5 group-hover:from-cyan-500/20 group-hover:to-cyan-500/5 group-hover:text-cyan-400"}`}>
                          {initials}
                        </div>
                        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                          {teacher.name || "Anonymous User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-white/40 group-hover:text-white/70 transition-colors">
                        {teacher.email}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-white/20">
                        {new Date(teacher.inserted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/admin/teachers/${teacher.teacher_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-black text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-widest"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-sm text-white/10 font-black uppercase tracking-widest">No educators found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
