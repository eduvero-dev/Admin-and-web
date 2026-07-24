"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAssessmentStore } from "@/store/assessmentStore";
import { getAssessmentByCode } from "@/lib/api";

export default function AssessmentPreviewPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const {
    assessment,
    selectedStudent,
    setAssessment,
    setAccessCode,
    setSelectedStudent,
  } = useAssessmentStore();

  const [loading, setLoading] = useState(!assessment);
  const [error, setError] = useState("");

  // Fetch when visiting via direct URL (store is empty)
  useEffect(() => {
    if (assessment) return;

    async function fetchAssessment() {
      setLoading(true);
      setError("");
      try {
        const data = await getAssessmentByCode(code.toUpperCase());
        setAssessment(data);
        setAccessCode(code.toUpperCase());
      } catch (err: any) {
        setError(err.message || "Assessment not found. Please check your access code.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [code]);

  const requestFullscreen = () => {
    const elem = document.documentElement as any;
    try {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } catch {}
  };

  const handleStart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (assessment?.roster?.length && !selectedStudent) return;
    requestFullscreen();
    router.push(`/assessment/${code}/take`);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#050a0f] flex flex-col items-center justify-center px-4 py-8 font-sans selection:bg-cyan-500/30">
      <div className="bg-blob -top-48 -left-48 opacity-60" />
      <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />

      <div className="w-full max-w-lg z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] w-16 h-16 relative">
            <Image src="/adaptive-icon.png" alt="Eduvero Logo" fill className="object-contain" />
          </div>
          <p className="text-cyan-400/90 text-[10px] font-bold tracking-[0.3em] uppercase">
            Access Code: <span className="text-white tracking-normal normal-case ml-1">{code.toUpperCase()}</span>
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="glass-card rounded-[2.5rem] p-12 flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-white font-bold">Fetching Assessment</p>
              <p className="text-white/30 text-xs font-medium">Looking up code <span className="text-cyan-400">{code.toUpperCase()}</span>…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold mb-1">Assessment Not Found</p>
              <p className="text-white/40 text-sm">{error}</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Enter a Different Code
            </button>
          </div>
        )}

        {/* Ready state */}
        {!loading && !error && assessment && (
          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            <div className="bg-white/5 border-b border-white/10 px-8 py-6">
              <h1 className="text-2xl font-bold text-white leading-tight mb-4">{assessment.title}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-cyan-500/20">
                  {assessment.questions.length} Questions
                </span>
                {assessment.passage && (
                  <span className="inline-flex items-center bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-amber-500/20">
                    Includes Passage
                  </span>
                )}
                {assessment.duration_minutes && (
                  <span className="inline-flex items-center bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-violet-500/20">
                    {assessment.duration_minutes} Min Limit
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                <p className="text-red-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-2">
                  Student Focus Protocol Active
                </p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Do not switch tabs or windows. Exiting fullscreen or navigating away will{" "}
                  <span className="text-red-400 font-bold underline">auto-submit</span> your assessment.
                </p>
              </div>

              <form onSubmit={handleStart}>
                {assessment.roster && assessment.roster.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-3 ml-1">
                      Student
                    </label>
                    <select
                      value={selectedStudent?.roll_number ?? ""}
                      onChange={(e) => {
                        const student =
                          assessment.roster?.find((item) => item.roll_number === e.target.value) ?? null;
                        setSelectedStudent(student);
                      }}
                      required
                      className="glass-input w-full px-5 py-4 text-sm font-bold rounded-2xl outline-none transition-all"
                    >
                      <option value="" className="bg-[#050a0f] text-white">
                        Select your name
                      </option>
                      {assessment.roster.map((student) => (
                        <option
                          key={student.roll_number}
                          value={student.roll_number}
                          className="bg-[#050a0f] text-white"
                        >
                          {student.name} ({student.roll_number})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!!assessment.roster?.length && !selectedStudent}
                  className="w-full py-5 rounded-2xl bg-cyan-500 text-[#021a1d] font-bold text-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Assessment →
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden">
        <div className="relative w-[120%] h-[120%] scale-150 transform-gpu rotate-[-15deg]">
          <Image src="/adaptive-icon.png" alt="Watermark" fill className="object-contain filter blur-[10px]" />
        </div>
      </div>
    </main>
  );
}
