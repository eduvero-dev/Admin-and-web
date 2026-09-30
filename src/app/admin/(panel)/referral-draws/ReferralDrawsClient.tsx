"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CircleDot,
  Clock3,
  Loader2,
  Plus,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { AdminReferralDraw, AdminReferralDrawListResponse } from "@/lib/types";
import { createReferralDrawAction } from "./actions";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function statusClasses(status: string) {
  if (status === "open")
    return "border-green-500/30 bg-green-500/10 text-green-400";
  if (status === "scheduled")
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  if (status === "reconciling" || status === "frozen")
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (["drawn", "claim_ready", "claimed"].includes(status)) {
    return "border-violet-500/30 bg-violet-500/10 text-violet-400";
  }
  return "border-white/10 bg-white/5 text-white/40";
}

function CreateDrawModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [drawAt, setDrawAt] = useState("");
  const [rulesUrl, setRulesUrl] = useState("");
  const [claimWindowDays, setClaimWindowDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Enter a name for this draw.");
      return;
    }
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const draw = new Date(drawAt);
    if (![start, end, draw].every((date) => Number.isFinite(date.getTime()))) {
      setError("Enter valid schedule dates and times.");
      return;
    }
    if (!(start < end && end <= draw)) {
      setError(
        "Qualification must end after it starts, and the draw cannot precede the end.",
      );
      return;
    }
    if (!rulesUrl.toLowerCase().startsWith("https://")) {
      setError("Official rules must use a secure HTTPS URL.");
      return;
    }

    setLoading(true);
    const result = await createReferralDrawAction({
      name: name.trim(),
      qualification_starts_at: start.toISOString(),
      qualification_ends_at: end.toISOString(),
      draw_at: draw.toISOString(),
      official_rules_url: rulesUrl.trim(),
      claim_window_days: claimWindowDays,
    });
    if (!result.ok) {
      setError(result.detail || result.error);
      setLoading(false);
      return;
    }
    router.push(`/admin/referral-draws/${result.data.draw_id}`);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#071018] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Referral Program
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Schedule a lucky draw
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/40 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-7 py-6">
          <Field label="Draw name">
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Fall 2026 Referral Draw"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="draw-input"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Qualification starts">
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="draw-input"
              />
            </Field>
            <Field label="Qualification ends">
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="draw-input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Draw time">
              <input
                type="datetime-local"
                required
                value={drawAt}
                onChange={(event) => setDrawAt(event.target.value)}
                className="draw-input"
              />
            </Field>
            <Field label="Claim window (days)">
              <input
                type="number"
                required
                min={1}
                max={90}
                value={claimWindowDays}
                onChange={(event) =>
                  setClaimWindowDays(Number(event.target.value))
                }
                className="draw-input"
              />
            </Field>
          </div>
          <Field label="Official rules URL">
            <input
              type="url"
              required
              pattern="https://.*"
              placeholder="https://eduvero.com/referral-rules"
              value={rulesUrl}
              onChange={(event) => setRulesUrl(event.target.value)}
              className="draw-input"
            />
          </Field>

          <p className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 text-[11px] font-medium leading-5 text-amber-200/60">
            Times are converted from this browser&apos;s local timezone to exact
            UTC instants before submission. Once a draw opens, its start is
            locked and later stages become progressively immutable.
          </p>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-black text-[#021a1d] hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create schedule
          </button>
        </form>
      </div>
      <style jsx>{`
        .draw-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 700;
          outline: none;
        }
        .draw-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
        }
        .draw-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

function Field({
  label: fieldLabel,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">
        {fieldLabel}
      </span>
      {children}
    </label>
  );
}

function DrawCard({ draw }: { draw: AdminReferralDraw }) {
  return (
    <Link
      href={`/admin/referral-draws/${draw.draw_id}`}
      className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-cyan-500/25 hover:bg-white/[0.04]"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${statusClasses(draw.status)}`}
          >
            {label(draw.status)}
          </span>
          <h3 className="mt-3 text-base font-black text-white">{draw.name}</h3>
          <p className="mt-1 text-[10px] font-bold text-white/20">
            #{draw.draw_id}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-white/15 group-hover:text-cyan-400" />
      </div>
      <div className="space-y-3 text-xs font-bold text-white/40">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-cyan-400/60" />
          Qualification ends {formatDate(draw.qualification_ends_at)}
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-violet-400/60" />
          Draw {formatDate(draw.draw_at)}
        </div>
        <div className="flex items-center gap-2">
          <CircleDot className="h-3.5 w-3.5 text-green-400/60" />
          {draw.entry_count ?? 0} committed entries
        </div>
      </div>
      {draw.winner && (
        <p className="mt-4 border-t border-white/5 pt-4 text-[10px] font-black uppercase tracking-widest text-amber-400/70">
          Winner: {label(draw.winner.status)}
        </p>
      )}
    </Link>
  );
}

export default function ReferralDrawsClient({
  data,
  error,
}: {
  data?: AdminReferralDrawListResponse;
  error: string;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const stats = useMemo(() => {
    const draws = data?.draws ?? [];
    return {
      active: draws.filter((draw) =>
        ["scheduled", "open", "reconciling", "frozen"].includes(draw.status),
      ).length,
      entries: draws.reduce(
        (total, draw) => total + (draw.entry_count ?? 0),
        0,
      ),
      completed: draws.filter((draw) => draw.status === "claimed").length,
    };
  }, [data]);

  return (
    <main className="min-h-screen p-6 text-white lg:p-10">
      <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
            Referral program
          </p>
          <h1 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-3xl font-black text-transparent">
            Lucky Draw Operations
          </h1>
          <p className="mt-1 text-sm font-medium text-white/30">
            Schedule, verify, draw, and audit $100 Amazon gift-card prizes.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#021a1d] hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          New draw
        </button>
      </header>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric
          icon={CalendarDays}
          value={stats.active}
          label="Active schedules"
          color="cyan"
        />
        <Metric
          icon={CircleDot}
          value={stats.entries}
          label="Entries across draws"
          color="green"
        />
        <Metric
          icon={Trophy}
          value={stats.completed}
          label="Completed draws"
          color="violet"
        />
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
        {data?.draws.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.draws.map((draw) => (
              <DrawCard key={String(draw.draw_id)} draw={draw} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-white/10" />
            <p className="text-sm font-black uppercase tracking-widest text-white/20">
              No referral draws scheduled
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/25">
              Create a future schedule after the program launch time is
              finalized.
            </p>
          </div>
        )}
      </div>

      {showCreate && <CreateDrawModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}

function Metric({
  icon: Icon,
  value,
  label: metricLabel,
  color,
}: {
  icon: typeof Trophy;
  value: number;
  label: string;
  color: "cyan" | "green" | "violet";
}) {
  const styles = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    green: "border-green-500/20 bg-green-500/10 text-green-400",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-400",
  }[color];
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">
        {metricLabel}
      </p>
    </div>
  );
}
