"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAssessmentStore } from "@/store/assessmentStore";
import { getAssessmentByCode } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { setAssessment, setAccessCode } = useAssessmentStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"choice" | "student">("choice");

  const navigateAdmin = () => {
    router.push("/admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const assessment = await getAssessmentByCode(trimmed);
      setAssessment(assessment);
      setAccessCode(trimmed);
      router.push(`/assessment/${trimmed}`);
    } catch {
      setError("Assessment not found. Please check your access code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#050a0f] px-4 font-sans selection:bg-cyan-500/30">
      {/* Background Blobs for the abstract butterfly effect */}
      <div className="bg-blob -top-48 -left-48 opacity-60" />
      <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />
      <div className="bg-blob top-1/4 right-0 opacity-20" />

      {/* Bottom Left Glow */}
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px] z-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-10">
        <div className="glass-card w-full rounded-[2rem] p-10 flex flex-col items-center">
          {/* Brand Logo */}
          <div className="w-24 h-24 mb-8 relative rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Image
              src="/adaptive-icon.png"
              alt="Eduvero Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-cyan-400/90 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
            {view !== "choice" && "Lockdown Browser"}
          </p>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 text-center">
            {view === "choice" ? "Welcome to Eduvero" : "Access Your Assessment"}
          </h1>
          <p className="text-cyan-400 text-sm font-medium mb-4">
            Secure Session Environment
          </p>

          {view === "choice" ? (
            <div className="w-full space-y-4">
              <button
                onClick={() => setView("student")}
                className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex flex-col items-center gap-2"
              >
                <span className="text-white font-bold text-xl">Student Access</span>
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Enter Assessment Code</span>
              </button>

              <button
                onClick={navigateAdmin}
                className="w-full py-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group flex flex-col items-center gap-2"
              >
                <span className="text-cyan-400 font-bold text-xl">Admin Login</span>
                <span className="text-cyan-400/50 text-[10px] uppercase tracking-widest font-bold">Administrative Dashboard</span>
              </button>
            </div>
          ) : (
            <>
              <p className="text-white/40 text-[11px] leading-relaxed mb-8 text-center max-w-[480px]">
                Copy the access code given to you by your teacher here.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="relative group">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-3 ml-1">
                    Access Code
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400/60">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="E.G. ABC123"
                      maxLength={10}
                      className="glass-input w-full pl-14 pr-6 py-5 text-xl font-bold tracking-[0.2em] rounded-2xl outline-none transition-all placeholder:text-white/10"
                      autoFocus
                      autoComplete="off"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3 text-center">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="w-full py-5 rounded-2xl bg-cyan-500 text-[#021a1d] font-bold text-lg shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Searching…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Find Assessment
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("choice")}
                    className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] hover:text-white/50 transition-colors"
                  >
                    Back to Selection
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Help Button */}
          <div className="mt-12 text-center">
            <p className="text-white/30 text-[10px] mb-4 tracking-wider">Need technical assistance?</p>
            <button onClick={() => window.open("https://www.eduvero.com/contact", "_blank")} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">?</span>
              Get Help
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <footer className="w-full max-w-lg mb-12 mt-8 z-10">
        <div className="flex items-center justify-center gap-8 text-[10px] font-bold tracking-[0.15em] text-white/20">
          <button onClick={() => window.open("https://www.eduvero.com/support", "_blank")} className="hover:text-cyan-400/60 transition-colors uppercase">System Check</button>
          <button onClick={() => window.open("https://www.eduvero.com/privacy-policy", "_blank")} className="hover:text-cyan-400/60 transition-colors uppercase">Privacy Policy</button>
          <button onClick={() => window.open("https://www.eduvero.com/terms-service", "_blank")} className="hover:text-cyan-400/60 transition-colors uppercase">Terms</button>
        </div>
      </footer>

      {/* Version */}
      <div className="absolute bottom-6 left-8 text-[9px] font-bold text-white/10 tracking-widest pointer-events-none">
        V 4.2.1-SECURE
      </div>

      {/* Butterfly/Abstract background image overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] flex items-center justify-center overflow-hidden">
        <div className="relative w-[120%] h-[120%] scale-150 transform-gpu">
          <Image
            src="/adaptive-icon.png"
            alt="Watermark"
            fill
            className="object-contain filter blur-[4px]"
            priority
          />
        </div>
      </div>
    </main>
  );
}
