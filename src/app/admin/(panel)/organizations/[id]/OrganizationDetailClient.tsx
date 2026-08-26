"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { OrganizationDetail, TeacherSummary } from "@/lib/types";
import {
  addOrganizationMembersAction,
  cancelOrganizationInviteAction,
  removeOrganizationMemberAction,
  resendOrganizationInviteAction,
  searchOrganizationTeachersAction,
} from "../actions";

interface Props {
  initialOrganization: OrganizationDetail;
}

type Notice = { type: "success" | "error"; text: string } | null;
type FailedActionResult = { ok: false; error: string; status?: number; detail?: string };

const reasonLabels: Record<string, string> = {
  deactivated: "Account is deactivated",
  onboarding_incomplete: "Onboarding incomplete",
  owns_organization: "Owns an organization",
  already_member: "Already in this organization",
  member_of_another_organization: "Member of another organization",
  pending_organization_invitation: "Has a pending organization invite",
  organization_not_ready: "Organization is not ready",
};

function lifecycleClasses(status: string) {
  if (status === "active") return "border-green-500/30 bg-green-500/10 text-green-400";
  if (status === "pending_owner") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (status === "pending_onboarding") return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  return "border-white/10 bg-white/5 text-white/40";
}

function human(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "N/A";
}

function isFailedActionResult(value: unknown): value is FailedActionResult {
  return (
    !!value &&
    typeof value === "object" &&
    "ok" in value &&
    (value as { ok: unknown }).ok === false &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

function actionErrorText(result: FailedActionResult) {
  return result.detail || result.error;
}

function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  if (!notice) return null;
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold ${notice.type === "success" ? "border-green-500/20 bg-green-500/10 text-green-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
      {notice.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
      <span className="flex-1">{notice.text}</span>
      <button onClick={onClose} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
    </div>
  );
}

function TeacherSearch({
  organizationId,
  disabled,
  selectedTeachers,
  onSelect,
}: {
  organizationId: number;
  disabled: boolean;
  selectedTeachers: TeacherSummary[];
  onSelect: (teacher: TeacherSummary) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeacherSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await searchOrganizationTeachersAction({ organizationId, query });
      if (!result.ok) {
        setError(result.detail || result.error);
        setResults([]);
        return;
      }
      setResults(result.data.teachers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search teachers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Search className="h-4 w-4 text-cyan-400" />
        <div>
          <h3 className="text-sm font-black text-white">Existing Platform Users</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Eligibility comes from the backend</p>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Search by email or name"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50 disabled:opacity-40"
        />
        <button disabled={disabled || loading} className="rounded-xl bg-cyan-500 px-4 text-xs font-black uppercase tracking-widest text-[#021a1d] disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </form>
      {error && <p className="mt-3 text-xs font-bold text-red-300">{error}</p>}
      <div className="mt-4 space-y-2">
        {results.map((teacher) => {
          const alreadySelected = selectedTeachers.some((item) => item.teacher_id === teacher.teacher_id);
          const eligible = teacher.eligible_for_organization !== false;
          return (
            <div key={teacher.teacher_id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white/80">{teacher.name || "Unnamed Teacher"}</p>
                <p className="truncate text-xs text-white/35">{teacher.email}</p>
                {!eligible && (
                  <p className="mt-1 text-[10px] font-bold text-amber-300">
                    {reasonLabels[teacher.ineligibility_reason || ""] || human(teacher.ineligibility_reason)}
                  </p>
                )}
              </div>
              <button
                onClick={() => onSelect(teacher)}
                disabled={!eligible || alreadySelected}
                className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 disabled:border-white/10 disabled:bg-white/5 disabled:text-white/20"
              >
                {alreadySelected ? "Selected" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewEmailInvites({
  disabled,
  invitees,
  setInvitees,
}: {
  disabled: boolean;
  invitees: Array<{ email: string; name: string }>;
  setInvitees: (invitees: Array<{ email: string; name: string }>) => void;
}) {
  const update = (index: number, key: "email" | "name", value: string) => {
    setInvitees(invitees.map((invitee, i) => i === index ? { ...invitee, [key]: value } : invitee));
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-violet-400" />
          <div>
            <h3 className="text-sm font-black text-white">New Email Invites</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Unknown emails reserve seats after success</p>
          </div>
        </div>
        <button disabled={disabled} onClick={() => setInvitees([...invitees, { email: "", name: "" }])} className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2 text-violet-300 disabled:opacity-40">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {invitees.map((invitee, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input disabled={disabled} type="email" value={invitee.email} onChange={(e) => update(index, "email", e.target.value)} placeholder="email@school.edu" className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none disabled:opacity-40" />
            <input disabled={disabled} value={invitee.name} onChange={(e) => update(index, "name", e.target.value)} placeholder="Name" className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none disabled:opacity-40" />
            <button disabled={disabled} onClick={() => setInvitees(invitees.filter((_, i) => i !== index))} className="rounded-xl border border-white/10 bg-white/5 px-3 text-white/40 hover:text-red-300 disabled:opacity-40">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {invitees.length === 0 && <p className="py-5 text-center text-xs font-bold text-white/20">No email invitees added.</p>}
      </div>
    </div>
  );
}

export default function OrganizationDetailClient({ initialOrganization }: Props) {
  const router = useRouter();
  const organization = initialOrganization;
  const [selectedTeachers, setSelectedTeachers] = useState<TeacherSummary[]>([]);
  const [emailInvitees, setEmailInvitees] = useState<Array<{ email: string; name: string }>>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();
  const [resendLocks, setResendLocks] = useState<Record<number, number>>({});
  const [batchIdempotencyKey, setBatchIdempotencyKey] = useState(() => crypto.randomUUID());

  const capacityPct = organization.paid_member_seats > 0
    ? Math.min(100, Math.round((organization.current_occupancy / organization.paid_member_seats) * 100))
    : 0;
  const cleanedInvitees = useMemo(
    () => emailInvitees
      .map((invitee) => ({ email: invitee.email.trim(), name: invitee.name.trim() }))
      .filter((invitee) => invitee.email),
    [emailInvitees]
  );
  const canSubmitBatch = organization.can_manage_members && (selectedTeachers.length > 0 || cleanedInvitees.length > 0) && !isPending;

  const refresh = () => router.refresh();

  const runMutation = (operation: () => Promise<unknown>, success: string) => {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (isFailedActionResult(result)) {
          setNotice({ type: "error", text: actionErrorText(result) });
          refresh();
          return;
        }
        setNotice({ type: "success", text: success });
        refresh();
      } catch (e) {
        setNotice({ type: "error", text: e instanceof Error ? e.message : "Action failed." });
        refresh();
      }
    });
  };

  const submitBatch = () => {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await addOrganizationMembersAction({
          organizationId: organization.organization_id,
          teacherIds: selectedTeachers.map((teacher) => teacher.teacher_id),
          emailInvitees: cleanedInvitees,
          idempotencyKey: batchIdempotencyKey,
        });
        if (!result.ok) {
          setNotice({ type: "error", text: actionErrorText(result) });
          if (result.status === 409 || result.status === 422) {
            setSelectedTeachers([]);
          }
          refresh();
          return;
        }
        setNotice({ type: "success", text: "Members and invitations were submitted." });
        setSelectedTeachers([]);
        setEmailInvitees([]);
        setBatchIdempotencyKey(crypto.randomUUID());
        refresh();
      } catch (e) {
        setNotice({ type: "error", text: e instanceof Error ? e.message : "Action failed." });
        refresh();
      }
    });
  };

  const resendInvite = (invitationId: number) => {
    runMutation(
      () => resendOrganizationInviteAction({ organizationId: organization.organization_id, invitationId }),
      "Invitation resend queued."
    );
    setResendLocks((locks) => ({ ...locks, [invitationId]: Date.now() + 5 * 60 * 1000 }));
  };

  return (
    <main className="min-h-screen p-6 text-white lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4">
          <Link href="/admin/organizations" className="mt-1 rounded-xl border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">Organization #{organization.organization_id}</p>
            <h1 className="max-w-3xl text-3xl font-black text-white">{organization.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${lifecycleClasses(organization.lifecycle_status)}`}>
                {human(organization.lifecycle_status)}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                {organization.billing_source} / {organization.billing_interval}
              </span>
              <span className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${organization.can_manage_members ? "border-green-500/20 bg-green-500/10 text-green-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
                {organization.can_manage_members ? "Member Controls Enabled" : "Member Controls Locked"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={refresh} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <NoticeBanner notice={notice} onClose={() => setNotice(null)} />

      {!organization.can_manage_members && (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm font-bold text-amber-200">
          Member controls unlock when the owner has claimed the organization, completed onboarding, is active, and the organization has an effective entitlement.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
            <div className="mb-5 flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-cyan-400" />
              <div>
                <h2 className="text-base font-black text-white">
                  {organization.owner?.invitation_status === "accepted" ? "Owner Assignment" : "Owner Invitation"}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                  {organization.owner?.email_delivery_status === "not_required"
                    ? "Onboarded owner notified in app"
                    : "Owner seat is free"}
                </p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex justify-between gap-4 text-xs">
                <span className="font-black uppercase tracking-widest text-white/25">Name</span>
                <span className="text-right font-bold text-white/70">{organization.owner?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="font-black uppercase tracking-widest text-white/25">Email</span>
                <span className="text-right font-bold text-white/70">{organization.owner?.email}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="font-black uppercase tracking-widest text-white/25">Owner Status</span>
                <span className="text-right font-bold capitalize text-white/70">{human(organization.owner?.invitation_status)}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="font-black uppercase tracking-widest text-white/25">
                  {organization.owner?.email_delivery_status === "not_required" ? "Notification" : "Delivery"}
                </span>
                <span className="text-right font-bold capitalize text-white/70">{human(organization.owner?.email_delivery_status)}</span>
              </div>
            </div>
            {organization.owner?.invitation_id && organization.owner.invitation_status !== "accepted" && (
              <button
                disabled={isPending}
                onClick={() => resendInvite(organization.owner.invitation_id!)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 py-3 text-xs font-black uppercase tracking-widest text-cyan-400 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Resend Owner Invite
              </button>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Capacity</p>
                <h2 className="text-base font-black text-white">{organization.current_occupancy}/{organization.paid_member_seats} member seats</h2>
              </div>
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${capacityPct}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold text-white/35">{organization.remaining_occupancy} remaining member seats. Owner is not counted.</p>
          </section>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <TeacherSearch
              organizationId={organization.organization_id}
              disabled={!organization.can_manage_members}
              selectedTeachers={selectedTeachers}
              onSelect={(teacher) => setSelectedTeachers([...selectedTeachers, teacher])}
            />
            <NewEmailInvites disabled={!organization.can_manage_members} invitees={emailInvitees} setInvitees={setEmailInvitees} />
          </div>

          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-white">Review Batch</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Submitted atomically by the backend</p>
              </div>
              <button onClick={submitBatch} disabled={!canSubmitBatch} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#021a1d] disabled:opacity-40">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Submit Batch
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/25">Selected Users</p>
                <div className="space-y-2">
                  {selectedTeachers.map((teacher) => (
                    <div key={teacher.teacher_id} className="flex items-center gap-2 text-xs">
                      <span className="min-w-0 flex-1 truncate font-bold text-white/70">{teacher.name} · {teacher.email}</span>
                      <button onClick={() => setSelectedTeachers(selectedTeachers.filter((item) => item.teacher_id !== teacher.teacher_id))} className="text-white/30 hover:text-red-300"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  {selectedTeachers.length === 0 && <p className="text-xs text-white/20">None selected.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/25">Email Invitees</p>
                <div className="space-y-2">
                  {cleanedInvitees.map((invitee) => (
                    <p key={invitee.email} className="truncate text-xs font-bold text-white/70">{invitee.name || "No name"} · {invitee.email}</p>
                  ))}
                  {cleanedInvitees.length === 0 && <p className="text-xs text-white/20">None added.</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/5 bg-white/[0.02]">
            <div className="border-b border-white/5 px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Members & Invitations</p>
              <h2 className="mt-1 text-base font-black text-white">{organization.members.length} records</h2>
            </div>
            <div className="divide-y divide-white/5">
              {organization.members.map((record) => {
                const isInvite = record.record_type === "invitation";
                const lockMs = Math.max(0, (resendLocks[record.invite_id] || 0) - Date.now());
                return (
                  <div key={`${record.record_type}-${record.invite_id}`} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-white">{record.teacher_name || record.teacher_email || "Pending invite"}</p>
                        <span className={`rounded-md border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${isInvite ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-green-500/20 bg-green-500/10 text-green-400"}`}>
                          {isInvite ? "Pending Seat" : "Active Member"}
                        </span>
                      </div>
                      <p className="truncate text-xs text-white/35">{record.teacher_email || record.teacher_id}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        {human(record.status)} · delivery {human(record.email_delivery_status)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isInvite ? (
                        <>
                          <button
                            disabled={isPending || lockMs > 0}
                            onClick={() => resendInvite(record.invite_id)}
                            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 disabled:opacity-40"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {lockMs > 0 ? "Queued" : "Resend"}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => runMutation(
                              () => cancelOrganizationInviteAction({ organizationId: organization.organization_id, invitationId: record.invite_id }),
                              "Invitation canceled."
                            )}
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 disabled:opacity-40"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isPending || !record.teacher_id}
                          onClick={() => runMutation(
                            () => removeOrganizationMemberAction({ organizationId: organization.organization_id, teacherId: record.teacher_id! }),
                            "Member removed."
                          )}
                          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {organization.members.length === 0 && (
                <div className="py-20 text-center">
                  <Users className="mx-auto mb-4 h-10 w-10 text-white/10" />
                  <p className="text-xs font-black uppercase tracking-widest text-white/20">No members or pending invites yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
