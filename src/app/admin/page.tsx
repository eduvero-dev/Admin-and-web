"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";

function AdminLoginContent() {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") === "unauthorized" ? "unauthorized" : "");
  const [checking, setChecking] = useState(true);

  // Session detection + redirect logic
  useEffect(() => {
    if (!userLoaded) return;

    if (isSignedIn) {
      // If we have an unauthorized error, do NOT redirect to dashboard.
      // Just unlock the UI so the user sees the Access Denied screen.
      if (error === "unauthorized") {
        setChecking(false);
        return;
      }

      // Normal sign-in → redirect to target
      const currentPath = window.location.pathname;
      const targetPath = redirectUrl.startsWith("http")
        ? new URL(redirectUrl).pathname
        : redirectUrl;

      if (targetPath !== currentPath) {
        router.replace(targetPath);
      } else {
        router.replace("/admin/dashboard");
      }
    } else {
      // Not signed in — show the login form
      setChecking(false);
    }
  }, [userLoaded, isSignedIn, error, router, redirectUrl]);

  // Intercept browser back button when on the unauthorized screen
  useEffect(() => {
    if (error !== "unauthorized") return;

    // Push a dummy history entry so Back triggers popstate, not actual navigation
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Navigate to the server-side sign-out route which revokes the session
      // (HttpOnly cookies can only be cleared server-side)
      localStorage.clear();
      window.location.replace("/api/auth/signout");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [error]);

  // Show loading only when we genuinely don't know user state yet
  if (checking || !userLoaded || !clerk) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#050a0f] font-sans">
        <div className="bg-blob -top-48 -left-48 opacity-60" />
        <div className="text-cyan-400 animate-pulse font-bold tracking-widest text-xs uppercase text-center">
          Verifying Secure Environment...
        </div>
      </div>
    );
  }

  // Unauthorized state: user is signed in but not an admin
  if (error === "unauthorized") {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#050a0f] px-4 font-sans">
        <div className="bg-blob -top-48 -left-48 opacity-60" />
        <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />
        <div className="z-10 flex flex-col items-center text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/40 text-sm mb-8">
            Your account does not have administrator privileges. Contact your system administrator to request access.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/api/auth/signout";
            }}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Sign Out &amp; Return Home
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/api/auth/signout";
            }}
            className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </main>
    );
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const signInAttempt = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await clerk.setActive({ session: signInAttempt.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError("Sign-in incomplete. Additional verification required.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.errors?.[0]?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/admin/sso-callback",
        redirectUrlComplete: redirectUrl,
      });
    } catch (err: any) {
      console.error("OAuth Error:", err);
      setError("Failed to initiate Google login.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#050a0f] px-4 font-sans selection:bg-cyan-500/30">
      {/* Background Blobs — same as landing page */}
      <div className="bg-blob -top-48 -left-48 opacity-60" />
      <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />
      <div className="bg-blob top-1/4 right-0 opacity-20" />

      {/* Bottom-right cyan glow — same as landing page */}
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px] z-0" />

      {/* Version watermark */}
      <div className="absolute bottom-6 left-8 text-[9px] font-bold text-white/10 tracking-widest pointer-events-none">
        V 4.2.1-SECURE
      </div>

      {/* Butterfly/logo background watermark — same as landing page */}
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

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-10">
        <div className="glass-card w-full rounded-[2.5rem] p-10 flex flex-col items-center">
          <div className="w-24 h-24 mb-8 relative rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Image src="/adaptive-icon.png" alt="Eduvero" fill className="object-contain" priority />
          </div>

          <p className="text-cyan-400/90 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-center">
            Administrative Access
          </p>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-white/30 text-xs font-medium mb-10 text-center">
            Authorized Personnel Only
          </p>

          <form onSubmit={handleEmailSignIn} className="w-full space-y-5 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1">Username or Email</label>
              <input
                type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@eduvero.com"
                className="glass-input w-full px-6 py-4 text-white font-medium rounded-xl outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] ml-1">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full px-6 py-4 text-white font-medium rounded-xl outline-none"
                required
              />
            </div>
            {error && <div className="text-red-400 text-[11px] text-center font-medium">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-cyan-500 text-[#021a1d] font-bold text-base shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:bg-cyan-400 transition-all disabled:opacity-50"
            >
              {loading ? "Authorizing..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="w-full flex items-center gap-4 mb-8">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          <div className="w-full ">
            <button
              onClick={signInWithGoogle}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Continue with Google</span>
            </button>
          </div>



          <button onClick={() => router.push("/")} className="mt-10 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] hover:text-white/50 transition-colors">
            Back to Selecion
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
