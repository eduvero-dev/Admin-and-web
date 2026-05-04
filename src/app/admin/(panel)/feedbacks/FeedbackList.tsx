"use client";

import { useState } from "react";
import { Image as ImageIcon, X, Download, ZoomIn, Calendar, Hash, ChevronDown, Loader2, Clock, Eye, CheckCircle2 } from "lucide-react";
import { Feedback } from "@/lib/types";
import { setFeedbackStatus } from "./actions";

type Status = "pending" | "in review" | "resolved";

interface FeedbackListProps {
  feedbacks: Feedback[];
  total: number;
}

const avatarGradients = [
  "from-cyan-500/30 to-blue-500/20 text-cyan-400 border-cyan-500/20",
  "from-violet-500/30 to-purple-500/20 text-violet-400 border-violet-500/20",
  "from-pink-500/30 to-rose-500/20 text-pink-400 border-pink-500/20",
  "from-amber-500/30 to-orange-500/20 text-amber-400 border-amber-500/20",
  "from-emerald-500/30 to-teal-500/20 text-emerald-400 border-emerald-500/20",
  "from-indigo-500/30 to-blue-500/20 text-indigo-400 border-indigo-500/20",
];

const statusConfig: Record<Status, { label: string; icon: React.ReactNode; badge: string; dot: string }> = {
  "pending":   { label: "Pending",   icon: <Clock className="w-3 h-3" />,        badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",  dot: "bg-amber-400 animate-pulse" },
  "in review": { label: "In Review", icon: <Eye className="w-3 h-3" />,          badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",     dot: "bg-blue-400" },
  "resolved":  { label: "Resolved",  icon: <CheckCircle2 className="w-3 h-3" />, badge: "border-green-500/30 bg-green-500/10 text-green-400",  dot: "bg-green-400" },
};

function getGradient(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return avatarGradients[n % avatarGradients.length];
}

function initials(name: string) {
  return name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
}

function accentBar(grad: string) {
  if (grad.includes("cyan"))    return "from-cyan-500/60 via-blue-500/40";
  if (grad.includes("violet"))  return "from-violet-500/60 via-purple-500/40";
  if (grad.includes("pink"))    return "from-pink-500/60 via-rose-500/40";
  if (grad.includes("amber"))   return "from-amber-500/60 via-orange-500/40";
  if (grad.includes("emerald")) return "from-emerald-500/60 via-teal-500/40";
  return "from-indigo-500/60 via-blue-500/40";
}

function FeedbackCard({ fb }: { fb: Feedback }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>((fb.status as Status) || "pending");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const grad = getGradient(fb.teacher_name || fb.feedback_id);
  const hasScreenshots = fb.screenshot_urls?.length > 0;
  const cfg = statusConfig[status];
  const statuses: Status[] = ["pending", "in review", "resolved"];

  const changeStatus = async (s: Status) => {
    if (s === status) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    try {
      await setFeedbackStatus(fb.feedback_id, s);
      setStatus(s);
    } catch {
      // silently revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/[0.07] bg-[#0a0f16] hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        {/* Accent bar */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${accentBar(grad)} to-transparent`} />

        <div className="flex flex-col flex-1 p-6 gap-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${grad} border flex items-center justify-center text-xs font-black shrink-0`}>
                {initials(fb.teacher_name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{fb.teacher_name || "Anonymous"}</p>
                <p className="text-[10px] text-white/30 font-medium truncate">{fb.teacher_email}</p>
              </div>
            </div>

            {/* Status pill + dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setOpen(v => !v)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 ${cfg.badge}`}
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : cfg.icon}
                {cfg.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-1 z-30 rounded-xl border border-white/10 bg-[#0d1520] shadow-2xl overflow-hidden min-w-[140px]">
                  {statuses.map(s => {
                    const c = statusConfig[s];
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(s)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold transition-colors hover:bg-white/5 ${s === status ? "bg-white/[0.03]" : ""}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        <span className={c.badge.split(" ").find(x => x.startsWith("text-")) ?? "text-white/60"}>
                          {c.label}
                        </span>
                        {s === status && <CheckCircle2 className="w-3 h-3 ml-auto text-white/20" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-white/65 leading-relaxed flex-1">{fb.details}</p>

          {/* Screenshots */}
          {hasScreenshots && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  {fb.screenshot_urls.length} Screenshot{fb.screenshot_urls.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {fb.screenshot_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all group/img"
                  >
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-bold">
              <Calendar className="w-3 h-3" />
              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(fb.inserted_at))}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-white/10 font-mono">
              <Hash className="w-2.5 h-2.5" />
              {fb.feedback_id.toString().slice(-8)}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-16 bg-black/90 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white/60 hover:text-white z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative max-w-full max-h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Screenshot"
              className="max-w-full max-h-[85vh] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).alt = "Image cannot be previewed"; }}
            />
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
              <a
                href={selectedImage}
                download
                className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {feedbacks.map(fb => <FeedbackCard key={fb.feedback_id} fb={fb} />)}
      {feedbacks.length === 0 && (
        <div className="col-span-3 py-32 text-center">
          <p className="text-sm text-white/10 font-black uppercase tracking-widest">No feedbacks yet</p>
        </div>
      )}
    </div>
  );
}
