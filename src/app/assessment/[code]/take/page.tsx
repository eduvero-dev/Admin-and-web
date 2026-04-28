"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
import { Volume2, VolumeX, Pause, Play, RotateCcw } from "lucide-react";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useHumanizedTTS } from "@/hooks/useHumanizedTTS";
import { submitAssessmentResults } from "@/lib/api";
import { useAssessmentStore } from "@/store/assessmentStore";

export default function TakeAssessmentPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    assessment,
    accessCode,
    answers,
    setAnswer,
    setSubmitted,
    setScore,
    setAutoSubmitted,
    autoSubmitted,
    readAloudEnabled,
    setReadAloudEnabled,
  } = useAssessmentStore();

  const { speak, stop, pause, resume, replay, isUsingPremium, isSpeaking, isPaused, lastSpokenText } = useHumanizedTTS(readAloudEnabled);

  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);

  // If store is empty (page refresh), redirect home
  useEffect(() => {
    if (!assessment) router.replace("/");
  }, [assessment, router]);

  const handleExit = useCallback(() => {
    if (confirm("Are you sure you want to exit the assessment? Your progress will not be saved if you haven't submitted.")) {
      stop(); // Stop any ongoing speech
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
      router.push("/");
    }
  }, [router, stop]);

  const toggleReadAloud = useCallback(() => {
    if (readAloudEnabled) {
      stop(); // Stop speech when disabling
    }
    setReadAloudEnabled(!readAloudEnabled);
  }, [readAloudEnabled, setReadAloudEnabled, stop]);

  const handleTextClick = useCallback(
    (text: string) => {
      if (readAloudEnabled) {
        speak(text);
      }
    },
    [readAloudEnabled, speak]
  );

  const doSubmit = useCallback(
    async (auto = false) => {
      if (!assessment || submitting) return;
      setSubmitting(true);
      setSubmitError("");
      if (auto) setAutoSubmitted(true);

      // Calculate score
      const total = assessment.questions.length;
      let correct = 0;
      assessment.questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) correct++;
      });
      const scoreVal = Math.round((correct / total) * 100);

      const now = new Date().toISOString().split("T")[0];

      // Transform answers (question_id -> label) to responses (index -> label) 
      // to match mobile app's backend expectations
      const responses: Record<string, string> = {};
      assessment.questions.forEach((q, index) => {
        if (answers[q.id]) {
          responses[index.toString()] = answers[q.id];
        }
      });

      try {
        await submitAssessmentResults({
          access_code: accessCode,
          assessment_id: parseInt(assessment.assessment_id),
          class_id: assessment.class_id ? parseInt(assessment.class_id) : 0,
          date_administered: now,
          score: scoreVal,
          submitted: now, // Backend expects simple date string
          responses: responses,
        });

        // Exit fullscreen on successful submission
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }

        setScore(scoreVal);
        setSubmitted(true);
        router.push(`/assessment/submitted`);
      } catch (err: any) {
        console.error("Submission error:", err);
        if (auto) {
          // Exit fullscreen on auto-submit
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
          }
          setScore(scoreVal);
          setSubmitted(true);
          router.push(`/assessment/submitted`);
        } else {
          setSubmitError("Failed to submit assessment. Please check your connection and try again.");
          setSubmitting(false);
        }
      }
    },
    [assessment, submitting, accessCode, answers, setAutoSubmitted, setScore, setSubmitted, router]
  );

  const handleWarn = useCallback(() => setShowWarning(true), []);
  const handleAutoSubmit = useCallback(() => {
    setShowWarning(false);
    doSubmit(true);
  }, [doSubmit]);

  useAntiCheat({
    active: !!assessment && !submitting,
    onWarn: handleWarn,
    onAutoSubmit: handleAutoSubmit,
  });

  if (!assessment) return null;

  const q = assessment.questions[currentQ];
  const totalQ = assessment.questions.length;
  const progress = ((currentQ + 1) / totalQ) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#050a0f] flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Background Blobs */}
      <div className="bg-blob -top-48 -left-48 opacity-40" />
      <div className="bg-blob -bottom-24 -right-24 opacity-30" />

      {/* ── Warning Overlay ── */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] bg-[#021a1d]/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="glass-card rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-3">Security Violation!</h2>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              You left the assessment window or exited fullscreen mode.
              <br /><strong className="text-red-400 uppercase tracking-widest text-[10px]">This is your final warning.</strong>
            </p>
            <p className="text-white/40 text-[11px] mb-8">
              A second violation will trigger an automatic submission of your assessment.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-4 bg-cyan-500 text-[#021a1d] font-bold rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/5 text-white px-6 pt-6 pb-8 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Image src="/adaptive-icon.png" alt="Logo" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight max-w-[200px] truncate">{assessment.title}</h1>
                <button
                  onClick={handleExit}
                  className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-400/80 mt-1 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[14px] leading-none">✕</span> Quit Assessment
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Read Aloud Toggle */}
              <button
                onClick={toggleReadAloud}
                className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl border-2 transition-all font-bold text-xs relative ${readAloudEnabled
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
                  }`}
              >
                {readAloudEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="uppercase tracking-wider hidden sm:inline">Read Aloud</span>
                {isUsingPremium && readAloudEnabled && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse" title="Premium Voice Active" />
                )}
              </button>

              {readAloudEnabled && (
                <div className="flex items-center gap-1.5">
                  {isSpeaking && (
                    <button
                      onClick={isPaused ? resume : pause}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-400 transition-all"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {lastSpokenText && (
                    <button
                      onClick={replay}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-400 transition-all"
                      title="Replay last"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="text-right">
                <p className="text-cyan-400/50 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
                <p className="text-white font-black text-xl tabular-nums">{answeredCount}<span className="text-white/20 px-1">/</span>{totalQ}</p>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mt-3">Question {currentQ + 1} of {totalQ}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-40 overflow-y-auto z-10 space-y-4">
        {/* Passage (if any) */}
        {assessment.passage && (
          <div className="glass-card rounded-2xl p-6 border-cyan-500/10 mb-4">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3">Reading Passage</p>
            <p
              onClick={() => handleTextClick(assessment.passage!)}
              className={`text-white/70 text-sm leading-relaxed whitespace-pre-line ${readAloudEnabled ? "cursor-pointer hover:text-white/90 transition-colors" : ""
                }`}
            >
              {assessment.passage}
            </p>
            {readAloudEnabled && (
              <p className="text-cyan-400/50 text-[9px] font-bold uppercase tracking-wider mt-3 flex items-center gap-1.5">
                <span>💡</span> Click text to hear it read aloud
              </p>
            )}
          </div>
        )}

        {/* Question Card */}
        <div className="glass-card rounded-[1.5rem] p-7 mb-6">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-3">Question {currentQ + 1}</p>
          <p
            onClick={() => handleTextClick(q.text)}
            className={`text-white font-semibold text-lg leading-relaxed ${readAloudEnabled ? "cursor-pointer hover:text-cyan-400 transition-colors" : ""
              }`}
          >
            {q.text}
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.label;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setAnswer(q.id, opt.label);
                  if (readAloudEnabled) {
                    handleTextClick(`${opt.label}. ${opt.text}`);
                  }
                }}
                className={`w-full text-left px-5 py-5 rounded-2xl border-2 transition-all active:scale-[0.98] flex items-center gap-4 ${selected
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:border-white/10"
                  }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black uppercase transition-all ${selected ? "bg-cyan-500 border-cyan-500 text-[#021a1d]" : "border-white/10 text-white/20"
                  }`}>
                  {opt.label}
                </span>
                <span className="text-sm font-bold tracking-tight">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/5 px-6 py-4 z-20">
        {submitError && (
          <div className="max-w-2xl mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-3">
            <span className="text-lg">✕</span> {submitError}
          </div>
        )}
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => setCurrentQ((i) => Math.max(0, i - 1))}
            disabled={currentQ === 0}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-white/40 font-bold text-sm disabled:opacity-20 hover:bg-white/5 transition-all"
          >
            ← Back
          </button>

          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ((i) => i + 1)}
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl bg-cyan-500 text-[#021a1d] font-bold text-sm hover:bg-cyan-400 disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
            >
              {submitting ? "Submitting…" : "End Session ✓"}
            </button>
          )}
        </div>

        {/* Question Dot Grid */}
        <div className="max-w-2xl mx-auto mt-6 flex flex-wrap gap-2 justify-center">
          {assessment.questions.map((q2, idx) => (
            <button
              key={q2.id}
              onClick={() => setCurrentQ(idx)}
              className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all ${idx === currentQ
                ? "bg-cyan-500 text-[#021a1d] shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : answers[q2.id]
                  ? "bg-white/20 text-white/50"
                  : "bg-white/5 text-white/10 hover:bg-white/10"
                }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Watermark overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
        <div className="relative w-[120%] h-[120%] scale-150 transform-gpu rotate-[10deg]">
          <Image
            src="/adaptive-icon.png"
            alt="Watermark"
            fill
            className="object-contain filter blur-[15px]"
          />
        </div>
      </div>
    </main>
  );
}
