"use client";

import { useState } from "react";
import Link from "next/link";
import { Feedback } from "@/lib/types";

interface FeedbackListProps {
  feedbacks: Feedback[];
  total: number;
}

export default function FeedbackList({ feedbacks, total }: FeedbackListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const initials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : '?';

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {feedbacks.map((fb) => (
          <div key={fb.feedback_id} className="group relative glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[5rem] group-hover:bg-cyan-500/10 transition-colors" />

            <div className="relative space-y-6">
              <header className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5 text-sm font-black text-white/50 uppercase group-hover:from-cyan-500/20 group-hover:to-cyan-500/5 group-hover:text-cyan-400 transition-all duration-500">
                    {initials(fb.teacher_name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white/90 truncate max-w-[140px]">{fb.teacher_name || "Anonymous User"}</h3>
                    <p className="text-xs text-white/30 font-medium truncate max-w-[160px]">{fb.teacher_email || "no-email@eduvero.id"}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/5 text-cyan-400`}>
                  Signal
                </div>
              </header>

              <div className="space-y-6">
                <p className="text-[15px] text-white/70 leading-relaxed font-medium min-h-[5rem]">
                  {fb.details}
                </p>

                {/* Screenshots Gallery */}
                {fb.screenshot_urls && fb.screenshot_urls.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Visual Evidence ({fb.screenshot_urls.length})</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {fb.screenshot_urls.map((url, index) => (
                        <button 
                          key={index} 
                          onClick={() => setSelectedImage(url)}
                          className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all group/img relative bg-white/[0.02]"
                        >
                          <img 
                            src={url} 
                            alt={`Evidence ${index + 1}`} 
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                            onError={(e) => {
                              // Fallback for broken images (like HEIC)
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=HEIC+Format';
                            }}
                          />
                          <div className="absolute inset-0 bg-cyan-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-black text-white/10 group-hover:text-white/20 uppercase tracking-[0.2em] transition-colors">
                  UUID: {fb.feedback_id}
                </div>
              </div>
            </div>

            <div className="relative mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/20 font-black uppercase tracking-widest">
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(fb.inserted_at))}
              </span>
              <button className="text-xs font-black text-white/30 hover:text-cyan-400 uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-cyan-400/5 border border-transparent hover:border-cyan-400/20">
                Resolve Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-20 bg-[#020508]/95 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="relative max-w-full max-h-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(34,211,238,0.1)]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Evidence Large" 
              className="max-w-full max-h-[85vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800?text=Image+Cannot+Be+Previewed+In+Browser';
              }}
            />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <a 
                href={selectedImage} 
                download 
                className="text-xs font-black text-white/60 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Original File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
