"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAssessmentStore } from "@/store/assessmentStore";

export default function SubmittedPage() {
  const router = useRouter();
  const { score, assessment, autoSubmitted, answers, reset } = useAssessmentStore();

  const total = assessment?.questions.length ?? 0;
  const correct = score !== null ? Math.round((score / 100) * total) : 0;

  const handleDone = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#050a0f] flex flex-col items-center justify-center px-4 py-8 font-sans selection:bg-cyan-500/30">
      {/* Background Blobs */}
      <div className="bg-blob -top-48 -left-48 opacity-50" />
      <div className="bg-blob -bottom-48 -right-48 opacity-30" />

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] w-16 h-16 relative">
            <Image
              src="/adaptive-icon.png"
              alt="Eduvero Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          {/* Score Header */}
          <div className={`${autoSubmitted ? 'bg-red-500/10' : 'bg-cyan-500/10'} border-b border-white/5 px-8 py-10 text-center`}>
            {autoSubmitted ? (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Auto-Submitted</h1>
                <p className="text-red-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Security Violation Detected</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Assessment Done!</h1>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Submission Successful</p>
              </>
            )}
          </div>

          <div className="p-8 space-y-6">
            {/* Score Display */}
            {score !== null ? (
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 text-center">
                <div className="text-4xl font-black text-white mb-2">{score}%</div>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">{correct} of {total} Correct</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/50 text-sm">Your results have been securely transmitted to your teacher.</p>
              </div>
            )}

            {/* Summary List */}
            {assessment && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-white/30">Assessment</span>
                  <span className="text-white truncate max-w-[150px]">{assessment.title}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-white/30">Completion</span>
                  <span className="text-white">{Math.round((Object.keys(answers).length / total) * 100)}%</span>
                </div>
              </div>
            )}

            <button
              onClick={handleDone}
              className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Back to Home
            </button>
          </div>
        </div>

        <p className="text-white/20 text-[10px] font-bold text-center mt-8 tracking-widest uppercase">
          Eduvero Student Secure Session
        </p>
      </div>

      {/* Watermark overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden">
        <div className="relative w-[120%] h-[120%] scale-150 transform-gpu rotate-[-15deg]">
          <Image
            src="/adaptive-icon.png"
            alt="Watermark"
            fill
            className="object-contain filter blur-[10px]"
          />
        </div>
      </div>
    </main>
  );
}
