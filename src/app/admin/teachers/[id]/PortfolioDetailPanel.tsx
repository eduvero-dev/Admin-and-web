"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  fetchAssessmentDetail, 
  fetchStrategyDetail, 
  fetchLessonPlanDetail 
} from "../actions";
import { 
  AssessmentDetail, 
  StrategyDetail, 
  LessonPlanDetail 
} from "@/lib/types";

interface PortfolioDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  type: "assessment" | "strategy" | "lesson" | null;
}

export default function PortfolioDetailPanel({ isOpen, onClose, itemId, type }: PortfolioDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !itemId || !type) return;

    async function loadData() {
      if (!itemId || !type) return;
      const activeId = itemId;

      setLoading(true);
      setError(null);
      setData(null);
      try {
        let result;
        if (type === "assessment") result = await fetchAssessmentDetail(activeId);
        else if (type === "strategy") result = await fetchStrategyDetail(activeId);
        else if (type === "lesson") result = await fetchLessonPlanDetail(activeId);
        setData(result);
      } catch (err) {
        setError("Failed to load details. The item may have been removed or is currently unavailable.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, itemId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020508]/60 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-xl bg-[#050a0f] border-l border-white/5 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-500 font-sans selection:bg-cyan-500/30">
        <header className="sticky top-0 z-20 bg-[#050a0f]/80 backdrop-blur-md p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">
              {type === "assessment" ? "Assessment Report" : type === "strategy" ? "Pedagogical Strategy" : "Lesson Architecture"}
            </p>
            <h3 className="text-xl font-black text-white">Resource Intelligence</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6">
              <div className="w-12 h-12 rounded-full border-t-2 border-cyan-500 animate-spin" />
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Decrypting details...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-sm font-bold text-white/60 mb-2">Access Denied</p>
              <p className="text-xs text-white/20 px-10 leading-relaxed font-medium">{error}</p>
            </div>
          ) : data && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Header Info */}
              <section className="space-y-4">
                <h4 className="text-3xl font-black text-white leading-tight">
                  {type === "assessment" ? data.name : data.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {type === "assessment" && (
                    <>
                      <Badge color="cyan">{data.subject}</Badge>
                      <Badge color="blue">Grade {data.grade_level}</Badge>
                      <Badge color="indigo">{data.num_questions} Questions</Badge>
                    </>
                  )}
                  {type === "strategy" && (
                    <>
                      <Badge color="violet">{data.strategy_type}</Badge>
                      <Badge color="purple">{data.performance_tier}</Badge>
                      <Badge color="fuchsia">{data.subject}</Badge>
                    </>
                  )}
                  {type === "lesson" && (
                    <>
                      <Badge color="cyan">Instructional Plan</Badge>
                      {data.usage_tags?.map((tag: string) => <Badge key={tag} color="white">{tag}</Badge>)}
                    </>
                  )}
                </div>
              </section>

              {/* Dynamic Content Sections */}
              <div className="grid grid-cols-1 gap-8">
                {type === "assessment" && (
                  <>
                    <CardSection title="Content Scope">
                      <p className="text-sm text-white/50 leading-relaxed">{data.sub_content}</p>
                    </CardSection>
                    <CardSection title="System Metadata">
                      <pre className="text-[10px] text-cyan-400/60 bg-white/[0.02] p-4 rounded-2xl border border-white/5 overflow-auto max-h-64 font-mono leading-relaxed">
                        {JSON.stringify(data.assessment, null, 2)}
                      </pre>
                    </CardSection>
                  </>
                )}

                {type === "strategy" && (
                  <>
                    <CardSection title="Foundational Description">
                      <div className="text-sm text-white/60 leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-white font-black" {...props} />,
                          }}
                        >
                          {data.description}
                        </ReactMarkdown>
                      </div>
                    </CardSection>
                    <div className="grid grid-cols-2 gap-4">
                      <StatsBox label="Subdomain" value={data.subdomain || "N/A"} />
                      <StatsBox label="Curriculum" value={data.curriculum || "General"} />
                    </div>
                    <CardSection title="Scaffold Support">
                      <p className="text-sm text-white/50 leading-relaxed italic">"{data.scaffold_support}"</p>
                    </CardSection>
                    <CardSection title="Implementation Protocol">
                      <div className="p-5 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10">
                        <p className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-widest">Protocol Hint</p>
                        <p className="text-sm text-white/70 leading-relaxed font-medium">{data.implementation_hint}</p>
                      </div>
                    </CardSection>
                  </>
                )}

                {type === "lesson" && (
                  <>
                    <CardSection title="Educational Objective">
                      <p className="text-sm text-white/60 leading-relaxed">{data.description}</p>
                    </CardSection>
                    <CardSection title="Lesson Architecture">
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-white/70 leading-loose font-medium overflow-hidden">
                        <ReactMarkdown 
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-black text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-black text-white/90 mt-6 mb-3 first:mt-0" {...props} />,
                            p: ({node, ...props}) => <p className="text-sm mb-4 last:mb-0 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="space-y-2 mb-6 ml-4 list-disc marker:text-cyan-500/50" {...props} />,
                            ol: ({node, ...props}) => <ol className="space-y-2 mb-6 ml-4 list-decimal marker:text-cyan-500/50" {...props} />,
                            li: ({node, ...props}) => <li className="pl-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                            code: ({node, ...props}) => <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-cyan-300" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-white/5" {...props} />,
                          }}
                        >
                          {data.lesson_plan}
                        </ReactMarkdown>
                      </div>
                    </CardSection>
                    <CardSection title="Associated Class Groups">
                      <div className="flex flex-wrap gap-2">
                        {data.class_ids?.map((id: number) => (
                          <div key={id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40">
                             Group PID: {id}
                          </div>
                        ))}
                      </div>
                    </CardSection>
                  </>
                )}
              </div>

              {/* Timestamp Footer */}
              <footer className="pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
                <p className="text-[8px] font-black uppercase tracking-widest text-white">Integrity Hash: {itemId?.slice(-12)}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white">Updated {new Date(data.updated_at).toLocaleDateString()}</p>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    white: "bg-white/5 text-white/40 border-white/10",
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colors[color] || colors.white}`}>
      {children}
    </span>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        {title}
      </h5>
      {children}
    </section>
  );
}

function StatsBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-white/80">{value}</p>
    </div>
  );
}
