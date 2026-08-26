"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  MessageSquare,
  ScrollText,
  ChevronRight,
  LogOut,
  Cpu,
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/admin/feedbacks", label: "Feedbacks", icon: MessageSquare },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Cpu },
  { href: "/admin/logs", label: "System Logs", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin");
  };

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[#040810] border-r border-white/5 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
          <img src="/adaptive-icon.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black tracking-tight text-white truncate">EduVero Admin</p>
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Control Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group ${
                active
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                  : "text-white/30 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-400" : "text-white/30 group-hover:text-white/60"}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-cyan-400/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Signed in</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
