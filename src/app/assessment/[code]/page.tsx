"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAssessmentStore } from "@/store/assessmentStore";

export default function AssessmentPreviewPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { assessment } = useAssessmentStore();

  const requestFullscreen = () => {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      requestFullscreen();
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
    router.push(`/assessment/${resolvedParams.code}/take`);
  };

  if (!assessment) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Session expired or invalid code.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#1A237E] text-white rounded-xl font-semibold"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#050a0f] flex flex-col items-center justify-center px-4 py-8 font-sans selection:bg-cyan-500/30">
      {/* Background Blobs */}
      <div className="bg-blob -top-48 -left-48 opacity-60" />
      <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />

      <div className="w-full max-w-lg z-10">
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
          <p className="text-cyan-400/90 text-[10px] font-bold tracking-[0.3em] uppercase">
            Access Code: <span className="text-white tracking-normal normal-case ml-1">{resolvedParams.code}</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          {/* Assessment Info Header */}
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
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Warning Section */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
              <p className="text-red-400 text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-2">
                Student Focus Protocol Active
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                Do not switch tabs or windows. Exiting fullscreen or navigating away will <span className="text-red-400 font-bold underline">auto-submit</span> your assessment.
              </p>
            </div>

            <form onSubmit={handleStart}>
              <button
                type="submit"
                className="w-full py-5 rounded-2xl bg-cyan-500 text-[#021a1d] font-bold text-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all"
              >
                Start Assessment →
              </button>
            </form>
          </div>
        </div>
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
