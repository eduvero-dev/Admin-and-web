"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  ClipboardList,
  Lightbulb,
  BookOpen,
  School,
  Settings,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  BookMarked,
  Users,
} from "lucide-react";
import { TeacherDetail } from "@/lib/types";
import { updateTeacherPlan } from "../actions";
import PortfolioDetailPanel from "./PortfolioDetailPanel";

interface TeacherDetailContentProps {
  teacher: TeacherDetail;
}

type Tab = "overview" | "assessments" | "strategies" | "lessons" | "classes" | "settings";

const formatGradeLevel = (grade: number): string => {
  if (grade === 0) return "K";
  if (grade === 1) return "1st";
  if (grade === 2) return "2nd";
  if (grade === 3) return "3rd";
  return `${grade}th`;
};

export default function TeacherDetailContent({ teacher }: TeacherDetailContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "assessment" | "strategy" | "lesson" } | null>(null);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [strategySearch, setStrategySearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"Freemium" | "Insight" | "Impact Pro">("Freemium");
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [planUpdateMessage, setPlanUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdatePlan = async () => {
    setIsUpdatingPlan(true);
    setPlanUpdateMessage(null);
    try {
      await updateTeacherPlan(teacher.teacher_id, selectedPlan);
      setPlanUpdateMessage({ type: "success", text: `Plan updated to ${selectedPlan} successfully!` });
      setTimeout(() => setPlanUpdateMessage(null), 5000);
    } catch (error: any) {
      setPlanUpdateMessage({ type: "error", text: error.message || "Failed to update plan" });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <User className="w-3.5 h-3.5" /> },
    { id: "assessments", label: "Assessments", icon: <ClipboardList className="w-3.5 h-3.5" />, count: teacher.total_assessments },
    { id: "strategies", label: "Strategies", icon: <Lightbulb className="w-3.5 h-3.5" />, count: teacher.total_strategies },
    { id: "lessons", label: "Lesson Plans", icon: <BookOpen className="w-3.5 h-3.5" />, count: teacher.total_lesson_plans },
    { id: "classes", label: "Classes", icon: <School className="w-3.5 h-3.5" />, count: teacher.total_class_periods },
    { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  const filterItems = (items: any[], searchKey: string, query: string) => {
    if (!query) return items ?? [];
    return (items ?? []).filter(item => item[searchKey]?.toLowerCase().includes(query.toLowerCase()));
  };

  const filteredAssessments = filterItems(teacher.assessments || [], "name", assessmentSearch);
  const filteredStrategies = filterItems(teacher.strategies || [], "title", strategySearch);
  const filteredLessons = filterItems(teacher.lesson_plans || [], "title", lessonSearch);
  const filteredClasses = filterItems(teacher.class_periods || [], "name", classSearch);

  return (
    <main className="min-h-screen text-white font-sans">

      {/* Top Header */}
      <div className="border-b border-white/5 bg-black/20 px-8 py-5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link
              href="/admin/teachers"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">{teacher.name}</h1>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{teacher.teacher_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${teacher.deactivated ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-green-500/20 bg-green-500/5 text-green-400"}`}>
              {teacher.deactivated ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {teacher.deactivated ? "Deactivated" : "Active"}
            </div>
            {teacher.completed_onboarding && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                <CheckCircle2 className="w-3 h-3" />
                Onboarded
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/5">
          {[
            { label: "Assessments", value: teacher.total_assessments, color: "text-cyan-400" },
            { label: "Strategies", value: teacher.total_strategies, color: "text-yellow-400" },
            { label: "Lesson Plans", value: teacher.total_lesson_plans, color: "text-indigo-400" },
            { label: "Results", value: teacher.total_assessment_results, color: "text-green-400" },
            { label: "Classes", value: teacher.total_class_periods, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-white/5 px-8 flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${activeTab === tab.id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/20"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-8 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Educator Profile</p>
              </div>
              <div className="px-8 py-6 space-y-5">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", value: teacher.email },
                  { icon: <GraduationCap className="w-3.5 h-3.5" />, label: "School Type", value: `${teacher.school_type} Educator` },
                  { icon: <BookMarked className="w-3.5 h-3.5" />, label: "Experience", value: `${teacher.years_teaching} Years · ${formatGradeLevel(teacher.grade_level)} Grade` },
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: "Location", value: `${teacher.state}, USA` },
                  { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Curriculum", value: teacher.curriculum || "Standard Content" },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: "Joined", value: new Date(teacher.inserted_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-white/30 mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-[10px] text-white/25 font-black uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-bold text-white/80 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="space-y-4">
              {[
                { label: "Assessments", value: teacher.total_assessments, tab: "assessments" as Tab, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                { label: "Strategies", value: teacher.total_strategies, tab: "strategies" as Tab, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                { label: "Lesson Plans", value: teacher.total_lesson_plans, tab: "lessons" as Tab, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                { label: "Classes", value: teacher.total_class_periods, tab: "classes" as Tab, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                { label: "Assessment Results", value: teacher.total_assessment_results, tab: null, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              ].map((s) => (
                <div
                  key={s.label}
                  onClick={() => s.tab && setActiveTab(s.tab)}
                  className={`glass-card rounded-2xl border ${s.border} px-6 py-4 flex items-center justify-between ${s.tab ? "cursor-pointer hover:bg-white/[0.03] transition-colors group" : ""}`}
                >
                  <div>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{s.label}</p>
                    <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                  {s.tab && <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />}
                </div>
              ))}
            </div>

            {/* Recent assessments preview */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Recent Assessments</p>
                <button onClick={() => setActiveTab("assessments")} className="text-[9px] font-black text-cyan-400/60 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-2">
                {(teacher.assessments || []).slice(0, 6).map((item) => (
                  <button
                    key={item.assessment_id}
                    onClick={() => setSelectedItem({ id: item.assessment_id.toString(), type: "assessment" })}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all group flex items-center gap-3"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors shrink-0" />
                    <p className="text-xs font-bold text-white/50 group-hover:text-white transition-colors truncate">{item.name}</p>
                    <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto shrink-0" />
                  </button>
                ))}
                {(teacher.assessments || []).length === 0 && (
                  <p className="text-xs text-white/15 text-center py-6 font-bold uppercase tracking-widest">None yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {activeTab === "assessments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Content</p>
                <h2 className="text-2xl font-black">Assessments <span className="text-white/20 text-base font-bold">({teacher.total_assessments})</span></h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={assessmentSearch}
                  onChange={e => setAssessmentSearch(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-all w-72"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAssessments.map((item) => (
                <button
                  key={item.assessment_id}
                  onClick={() => setSelectedItem({ id: item.assessment_id.toString(), type: "assessment" })}
                  className="glass-card text-left p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-cyan-400" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-cyan-400 transition-colors mt-1" />
                  </div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">{item.name}</p>
                  <p className="text-[9px] text-white/15 font-black uppercase tracking-widest mt-3">ID: {item.assessment_id}</p>
                </button>
              ))}
              {filteredAssessments.length === 0 && (
                <div className="col-span-3 py-20 text-center">
                  <ClipboardList className="w-10 h-10 text-white/5 mx-auto mb-3" />
                  <p className="text-xs text-white/15 font-black uppercase tracking-widest">No assessments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STRATEGIES TAB */}
        {activeTab === "strategies" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mb-1">Teaching</p>
                <h2 className="text-2xl font-black">Strategies <span className="text-white/20 text-base font-bold">({teacher.total_strategies})</span></h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={strategySearch}
                  onChange={e => setStrategySearch(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-yellow-500/40 transition-all w-72"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStrategies.map((item) => (
                <button
                  key={item.strategy_id}
                  onClick={() => setSelectedItem({ id: item.strategy_id.toString(), type: "strategy" })}
                  className="glass-card text-left p-6 rounded-2xl border border-white/5 hover:border-yellow-500/30 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-yellow-400 transition-colors mt-1" />
                  </div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">{item.title}</p>
                  <p className="text-[9px] text-white/15 font-black uppercase tracking-widest mt-3">ID: {item.strategy_id}</p>
                </button>
              ))}
              {filteredStrategies.length === 0 && (
                <div className="col-span-3 py-20 text-center">
                  <Lightbulb className="w-10 h-10 text-white/5 mx-auto mb-3" />
                  <p className="text-xs text-white/15 font-black uppercase tracking-widest">No strategies found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LESSONS TAB */}
        {activeTab === "lessons" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Curriculum</p>
                <h2 className="text-2xl font-black">Lesson Plans <span className="text-white/20 text-base font-bold">({teacher.total_lesson_plans})</span></h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  type="text"
                  placeholder="Search lesson plans..."
                  value={lessonSearch}
                  onChange={e => setLessonSearch(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-all w-72"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLessons.map((item) => (
                <button
                  key={item.lesson_plan_id}
                  onClick={() => setSelectedItem({ id: item.lesson_plan_id.toString(), type: "lesson" })}
                  className="glass-card text-left p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-indigo-400 transition-colors mt-1" />
                  </div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors leading-snug">{item.title}</p>
                  <p className="text-[9px] text-white/15 font-black uppercase tracking-widest mt-3">ID: {item.lesson_plan_id}</p>
                </button>
              ))}
              {filteredLessons.length === 0 && (
                <div className="col-span-3 py-20 text-center">
                  <BookOpen className="w-10 h-10 text-white/5 mx-auto mb-3" />
                  <p className="text-xs text-white/15 font-black uppercase tracking-widest">No lesson plans found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLASSES TAB */}
        {activeTab === "classes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Active</p>
                <h2 className="text-2xl font-black">Classes <span className="text-white/20 text-base font-bold">({teacher.total_class_periods})</span></h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition-all w-72"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClasses.map((period) => (
                <div
                  key={period.class_id}
                  className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <School className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-purple-400">{period.num_students}</p>
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Students</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{period.name}</p>
                  <p className="text-[9px] text-white/15 font-black uppercase tracking-widest mt-2">Class ID: {period.class_id}</p>
                </div>
              ))}
              {filteredClasses.length === 0 && (
                <div className="col-span-3 py-20 text-center">
                  <School className="w-10 h-10 text-white/5 mx-auto mb-3" />
                  <p className="text-xs text-white/15 font-black uppercase tracking-widest">No classes found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-xl space-y-6">
            {/* Subscription Plan */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-0.5">Billing</p>
                <h3 className="text-base font-black">Subscription Plan</h3>
              </div>
              <div className="px-8 py-6 space-y-4">
                <div className="space-y-2">
                  {(["Freemium", "Insight", "Impact Pro"] as const).map((plan) => (
                    <label
                      key={plan}
                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlan === plan ? "border-purple-500/40 bg-purple-500/10" : "border-white/5 bg-white/[0.02] hover:border-white/10"}`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan}
                        checked={selectedPlan === plan}
                        onChange={(e) => setSelectedPlan(e.target.value as typeof selectedPlan)}
                        className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <div>
                        <p className="text-sm font-bold text-white/80">{plan}</p>
                        <p className="text-[10px] text-white/30 font-medium">
                          {plan === "Freemium" ? "Basic access, limited features" : plan === "Insight" ? "Enhanced analytics & tools" : "Full platform access"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {planUpdateMessage && (
                  <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${planUpdateMessage.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {planUpdateMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {planUpdateMessage.text}
                  </div>
                )}
                <button
                  onClick={handleUpdatePlan}
                  disabled={isUpdatingPlan}
                  className="w-full py-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-black text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 uppercase tracking-widest transition-all"
                >
                  {isUpdatingPlan ? "Updating..." : "Update Plan"}
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-0.5">Admin Actions</p>
                <h3 className="text-base font-black">Account Management</h3>
              </div>
              <div className="px-8 py-6 space-y-3">
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-white/40 hover:text-white hover:bg-white/10 uppercase tracking-widest transition-all">
                  Send Password Reset Link
                </button>
                <button className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-black text-red-500/60 hover:text-red-400 hover:bg-red-500/20 uppercase tracking-widest transition-all">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <PortfolioDetailPanel
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        itemId={selectedItem?.id || null}
        type={selectedItem?.type || null}
      />
    </main>
  );
}
