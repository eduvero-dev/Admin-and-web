"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-[#050a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <AuthenticateWithRedirectCallback 
          signInForceRedirectUrl="/admin/dashboard"
          signUpForceRedirectUrl="/admin/dashboard"
        />
        <div className="text-cyan-400 animate-pulse font-bold tracking-widest text-[10px] uppercase">
          Verifying Identity...
        </div>
      </div>
    </div>
  );
}
