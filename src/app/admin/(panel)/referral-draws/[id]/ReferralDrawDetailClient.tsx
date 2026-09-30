"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Gift,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { AdminReferralDraw, AdminReferralDrawAuditEvent } from "@/lib/types";
import {
  cancelReferralDrawAction,
  configureReferralGiftCardAction,
  disqualifyReferralWinnerAction,
  executeReferralDrawAction,
  freezeReferralDrawAction,
  updateReferralDrawAction,
} from "../actions";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function label(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "none";
}

type CommandResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; detail?: string };

export default function ReferralDrawDetailClient({
  draw,
  audit,
  error: initialError,
}: {
  draw?: AdminReferralDraw;
  audit: AdminReferralDrawAuditEvent[];
  error: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"cancel" | "gift" | "disqualify" | null>(
    null,
  );

  if (!draw) {
    return (
      <main className="min-h-screen p-6 text-white lg:p-10">
        <Link
          href="/admin/referral-draws"
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Referral draws
        </Link>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">
          {error || "Referral draw not found."}
        </div>
      </main>
    );
  }

  const winnerStatus = draw.winner?.status ?? "none";
  const mutable = ["scheduled", "open"].includes(draw.status);
  const canCancel = ["scheduled", "open", "reconciling"].includes(draw.status);
  const canFreeze =
    ["open", "reconciling"].includes(draw.status) &&
    new Date(draw.qualification_ends_at).getTime() <= Date.now();
  const canDraw = draw.status === "frozen";
  const canRedraw = draw.status === "drawn" && winnerStatus === "disqualified";
  const canConfigureGift =
    draw.status === "drawn" && winnerStatus === "selected";
  const canDisqualify =
    ["drawn", "claim_ready"].includes(draw.status) &&
    Boolean(draw.winner) &&
    !["claimed", "disqualified"].includes(winnerStatus);

  const runCommand = async (
    key: string,
    operation: () => Promise<CommandResult>,
    success: string,
  ) => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      const result = await operation();
      if (!result.ok) {
        setError(result.detail || result.error);
        return;
      }
      setNotice(success);
      setModal(null);
      router.refresh();
    } catch (commandError) {
      setError(
        commandError instanceof Error ? commandError.message : "Action failed.",
      );
    } finally {
      setBusy("");
    }
  };

  const confirmAndRun = (
    message: string,
    key: string,
    operation: () => Promise<CommandResult>,
    success: string,
  ) => {
    if (window.confirm(message)) void runCommand(key, operation, success);
  };

  return (
    <main className="min-h-screen p-6 text-white lg:p-10">
      <Link
        href="/admin/referral-draws"
        className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400/70 hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Referral draws
      </Link>

      <header className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-400">
              {label(draw.status)}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
              Winner {label(winnerStatus)}
            </span>
          </div>
          <h1 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-3xl font-black text-transparent">
            {draw.name}
          </h1>
          <p className="mt-1 text-sm font-medium text-white/30">
            Draw #{draw.draw_id} · Operational controls are enforced again by
            the backend&apos;s state machine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mutable && (
            <ActionButton
              icon={CalendarClock}
              label="Edit schedule"
              onClick={() => setEditing(true)}
            />
          )}
          {canCancel && (
            <ActionButton
              danger
              icon={Ban}
              label="Cancel"
              busy={busy === "cancel"}
              onClick={() => setModal("cancel")}
            />
          )}
          {canFreeze && (
            <ActionButton
              icon={Snowflake}
              label="Freeze"
              busy={busy === "freeze"}
              onClick={() =>
                confirmAndRun(
                  "Freeze this draw and cryptographically snapshot all eligible entries?",
                  "freeze",
                  () => freezeReferralDrawAction(draw.draw_id),
                  "Entry snapshot frozen.",
                )
              }
            />
          )}
          {canDraw && (
            <ActionButton
              primary
              icon={Trophy}
              label="Run draw"
              busy={busy === "draw"}
              onClick={() =>
                confirmAndRun(
                  "Run the cryptographic draw against the frozen snapshot?",
                  "draw",
                  () => executeReferralDrawAction({ drawId: draw.draw_id }),
                  "Winner selected. Configure the gift card before they can claim.",
                )
              }
            />
          )}
          {canRedraw && (
            <ActionButton
              primary
              icon={RefreshCw}
              label="Run redraw"
              busy={busy === "redraw"}
              onClick={() =>
                confirmAndRun(
                  "Select a new winner from the restored eligible entries?",
                  "redraw",
                  () =>
                    executeReferralDrawAction({
                      drawId: draw.draw_id,
                      redraw: true,
                    }),
                  "A new provisional winner was selected.",
                )
              }
            />
          )}
          {canConfigureGift && (
            <ActionButton
              primary
              icon={Gift}
              label="Configure gift card"
              onClick={() => setModal("gift")}
            />
          )}
          {canDisqualify && (
            <ActionButton
              danger
              icon={AlertTriangle}
              label="Disqualify winner"
              onClick={() => setModal("disqualify")}
            />
          )}
        </div>
      </header>

      {error && <Message error>{error}</Message>}
      {notice && <Message>{notice}</Message>}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric
          icon={CircleDot}
          value={draw.entry_count ?? 0}
          label="Committed entries"
        />
        <Metric
          icon={ShieldCheck}
          value={draw.eligible_entry_count ?? draw.entry_count ?? 0}
          label="Eligible entries"
        />
        <Metric
          icon={ClipboardCheck}
          value={draw.minimum_age}
          label="Minimum participant age"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 xl:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-black">Schedule</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ScheduleItem
              label="Qualification starts"
              value={formatDate(draw.qualification_starts_at)}
            />
            <ScheduleItem
              label="Qualification ends"
              value={formatDate(draw.qualification_ends_at)}
            />
            <ScheduleItem label="Draw time" value={formatDate(draw.draw_at)} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScheduleItem
              label="Claim window"
              value={`${draw.claim_window_days} days${draw.winner?.claim_deadline_at ? ` · deadline ${formatDate(draw.winner.claim_deadline_at)}` : ""}`}
            />
            <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25">
                Official rules
              </p>
              <a
                href={draw.official_rules_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block truncate text-sm font-bold text-cyan-400 hover:underline"
              >
                {draw.official_rules_url}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Gift className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black">Prize state</h2>
          </div>
          <div className="space-y-4">
            <ScheduleItem label="Winner status" value={label(winnerStatus)} />
            <ScheduleItem
              label="Stored card"
              value={
                draw.winner?.gift_card_last_four
                  ? `•••• ${draw.winner.gift_card_last_four}`
                  : "Not configured"
              }
            />
            <ScheduleItem
              label="Claimed"
              value={formatDate(draw.winner?.claimed_at)}
            />
          </div>
          <p className="mt-4 text-[10px] font-medium leading-4 text-white/25">
            Full gift-card codes are write-only here. Admin responses and audit
            events expose at most the final four characters.
          </p>
        </section>
      </div>

      {draw.snapshot_sha256 && (
        <section className="mt-6 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-5">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-4 w-4 text-violet-400" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-400/60">
                Frozen SHA-256 snapshot
              </p>
              <p className="mt-1 break-all font-mono text-xs text-white/45">
                {draw.snapshot_sha256}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-lg font-black">Append-only audit</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              No prize secrets are displayed
            </p>
          </div>
        </div>
        {audit.length ? (
          <div className="space-y-3">
            {audit.map((event) => (
              <div
                key={String(event.event_id)}
                className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-white/70">
                      {label(event.event_type)}
                    </p>
                    <p className="text-[10px] font-bold text-white/20">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/20">
                    Administrator {event.actor_id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-xs font-bold text-white/20">
            No audit events yet.
          </p>
        )}
      </section>

      {editing && (
        <EditScheduleModal
          draw={draw}
          busy={busy === "edit"}
          onClose={() => setEditing(false)}
          onSubmit={(payload) =>
            runCommand(
              "edit",
              () => updateReferralDrawAction({ drawId: draw.draw_id, payload }),
              "Schedule updated.",
            ).then(() => setEditing(false))
          }
        />
      )}
      {modal === "cancel" && (
        <TextCommandModal
          title="Cancel referral draw"
          label="Cancellation reason"
          description="Cancellation releases this non-frozen draw's credits for a later schedule. The reason is written to the append-only audit log."
          confirmLabel="Cancel draw and release credits"
          busy={busy === "cancel"}
          onClose={() => setModal(null)}
          onSubmit={(reason) =>
            runCommand(
              "cancel",
              () => cancelReferralDrawAction({ drawId: draw.draw_id, reason }),
              "Draw cancelled and credits released.",
            )
          }
        />
      )}
      {modal === "gift" && (
        <TextCommandModal
          title="Configure Amazon gift card"
          label="Amazon claim code"
          description="The code is encrypted by the backend and never returned to admin clients. Verify it carefully before submitting."
          secret
          confirmLabel="Commit encrypted prize"
          busy={busy === "gift"}
          onClose={() => setModal(null)}
          onSubmit={(claimCode) =>
            runCommand(
              "gift",
              () =>
                configureReferralGiftCardAction({
                  drawId: draw.draw_id,
                  claimCode,
                }),
              "Gift card committed and winner notification staged.",
            )
          }
        />
      )}
      {modal === "disqualify" && (
        <TextCommandModal
          title="Disqualify provisional winner"
          label="Reason"
          description="This invalidates the unclaimed winner, recycles the unclaimed card, and requires an explicit redraw."
          confirmLabel="Disqualify winner"
          busy={busy === "disqualify"}
          onClose={() => setModal(null)}
          onSubmit={(reason) =>
            runCommand(
              "disqualify",
              () =>
                disqualifyReferralWinnerAction({
                  drawId: draw.draw_id,
                  reason,
                }),
              "Winner disqualified. Run an explicit redraw when ready.",
            )
          }
        />
      )}
    </main>
  );
}

function Message({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold ${error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-green-500/20 bg-green-500/10 text-green-300"}`}
    >
      {error ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {children}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label: buttonLabel,
  onClick,
  busy = false,
  primary = false,
  danger = false,
}: {
  icon: typeof Trophy;
  label: string;
  onClick: () => void;
  busy?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const colors = danger
    ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
    : primary
      ? "border-cyan-400 bg-cyan-500 text-[#021a1d] hover:bg-cyan-400"
      : "border-white/10 bg-white/5 text-white/60 hover:text-white";
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-40 ${colors}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {buttonLabel}
    </button>
  );
}

function Metric({
  icon: Icon,
  value,
  label: metricLabel,
}: {
  icon: typeof Trophy;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5">
      <Icon className="mb-3 h-5 w-5 text-cyan-400" />
      <p className="text-2xl font-black text-cyan-400">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">
        {metricLabel}
      </p>
    </div>
  );
}

function ScheduleItem({
  label: itemLabel,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/25">
        {itemLabel}
      </p>
      <p className="mt-2 text-sm font-bold capitalize text-white/70">{value}</p>
    </div>
  );
}

function EditScheduleModal({
  draw,
  busy,
  onClose,
  onSubmit,
}: {
  draw: AdminReferralDraw;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    qualification_starts_at?: string;
    qualification_ends_at: string;
    draw_at: string;
    official_rules_url: string;
    claim_window_days: number;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(draw.name);
  const [startsAt, setStartsAt] = useState(
    toLocalInput(draw.qualification_starts_at),
  );
  const [endsAt, setEndsAt] = useState(
    toLocalInput(draw.qualification_ends_at),
  );
  const [drawAt, setDrawAt] = useState(toLocalInput(draw.draw_at));
  const [rulesUrl, setRulesUrl] = useState(draw.official_rules_url);
  const [claimDays, setClaimDays] = useState(draw.claim_window_days);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const drawDate = new Date(drawAt);
    if (
      ![start, end, drawDate].every((date) =>
        Number.isFinite(date.getTime()),
      ) ||
      !(start < end && end <= drawDate)
    ) {
      setError("Enter a valid ordered schedule.");
      return;
    }
    if (!rulesUrl.toLowerCase().startsWith("https://")) {
      setError("Official rules must use HTTPS.");
      return;
    }
    await onSubmit({
      name: name.trim(),
      ...(draw.status === "scheduled"
        ? { qualification_starts_at: start.toISOString() }
        : {}),
      qualification_ends_at: end.toISOString(),
      draw_at: drawDate.toISOString(),
      official_rules_url: rulesUrl.trim(),
      claim_window_days: claimDays,
    });
  };

  return (
    <ModalShell title="Edit draw schedule" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ModalField label="Draw name">
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="modal-input"
          />
        </ModalField>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModalField label="Qualification starts">
            <input
              type="datetime-local"
              required
              disabled={draw.status !== "scheduled"}
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="modal-input disabled:opacity-35"
            />
          </ModalField>
          <ModalField label="Qualification ends">
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className="modal-input"
            />
          </ModalField>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModalField label="Draw time">
            <input
              type="datetime-local"
              required
              value={drawAt}
              onChange={(event) => setDrawAt(event.target.value)}
              className="modal-input"
            />
          </ModalField>
          <ModalField label="Claim window days">
            <input
              type="number"
              min={1}
              max={90}
              required
              value={claimDays}
              onChange={(event) => setClaimDays(Number(event.target.value))}
              className="modal-input"
            />
          </ModalField>
        </div>
        <ModalField label="Official rules URL">
          <input
            type="url"
            required
            value={rulesUrl}
            onChange={(event) => setRulesUrl(event.target.value)}
            className="modal-input"
          />
        </ModalField>
        {draw.status === "open" && (
          <p className="text-[10px] font-bold text-amber-300/50">
            This draw is open. Its start is locked and the backend only accepts
            later end/draw times.
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-300">
            {error}
          </p>
        )}
        <SubmitButton busy={busy} label="Save schedule" />
      </form>
    </ModalShell>
  );
}

function TextCommandModal({
  title,
  label: fieldLabel,
  description,
  confirmLabel,
  secret = false,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  description: string;
  confirmLabel: string;
  secret?: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  return (
    <ModalShell title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) void onSubmit(value.trim());
        }}
        className="space-y-4"
      >
        <p className="text-xs font-medium leading-5 text-white/35">
          {description}
        </p>
        <ModalField label={fieldLabel}>
          <input
            type={secret ? "password" : "text"}
            autoComplete="off"
            required
            minLength={secret ? 4 : 3}
            maxLength={secret ? 512 : 2000}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="modal-input"
          />
        </ModalField>
        <SubmitButton busy={busy} label={confirmLabel} danger={!secret} />
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#071018] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/40 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
        <style jsx>{`
          .modal-input {
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
          .modal-input:focus {
            border-color: rgba(6, 182, 212, 0.5);
          }
          .modal-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.6;
          }
        `}</style>
      </div>
    </div>
  );
}

function ModalField({
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

function SubmitButton({
  busy,
  label: buttonLabel,
  danger = false,
}: {
  busy: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      disabled={busy}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black disabled:opacity-50 ${danger ? "bg-red-500 text-white hover:bg-red-400" : "bg-cyan-500 text-[#021a1d] hover:bg-cyan-400"}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {buttonLabel}
    </button>
  );
}
