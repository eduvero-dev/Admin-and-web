"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  OrganizationBillingSource,
  OrganizationLifecycleStatus,
  OrganizationListResponse,
  OrganizationSummary,
} from "@/lib/types";
import { createOrganizationAction } from "./actions";

interface Props {
  data?: OrganizationListResponse;
  error: string;
  currentPage: number;
  search: string;
  lifecycleStatus: OrganizationLifecycleStatus | "";
  billingSource: OrganizationBillingSource | "";
}

const lifecycleOptions: Array<OrganizationLifecycleStatus | ""> = [
  "",
  "pending_owner",
  "pending_onboarding",
  "active",
  "inactive",
];
const billingOptions: Array<OrganizationBillingSource | ""> = ["", "manual", "stripe"];

function label(value: string) {
  return value ? value.replaceAll("_", " ") : "All";
}

function statusClasses(status: OrganizationLifecycleStatus) {
  if (status === "active") return "border-green-500/30 bg-green-500/10 text-green-400";
  if (status === "pending_owner") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (status === "pending_onboarding") return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  return "border-white/10 bg-white/5 text-white/40";
}

function CreateOrganizationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [paidMemberSeats, setPaidMemberSeats] = useState(8);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minSeats = billingInterval === "month" ? 8 : 5;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await createOrganizationAction({
        name,
        ownerEmail,
        ownerName,
        billingInterval,
        paidMemberSeats,
        idempotencyKey,
      });
      if (!result.ok) {
        setError(result.detail || result.error);
        setLoading(false);
        return;
      }
      setLoading(false);
      onClose();
      router.push(`/admin/organizations/${result.data.organization_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create organization.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#071018] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Manual Plan</p>
            <h2 className="mt-1 text-xl font-black text-white">Create Organization</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-7 py-6">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">Organization Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">Owner Name</label>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">Owner Email</label>
              <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">Billing Interval</label>
              <select
                value={billingInterval}
                onChange={(e) => {
                  const next = e.target.value as "month" | "year";
                  setBillingInterval(next);
                  setPaidMemberSeats((seats) => Math.max(next === "month" ? 8 : 5, seats));
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50"
              >
                <option className="bg-[#050a0f]" value="month">Monthly</option>
                <option className="bg-[#050a0f]" value="year">Yearly</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/30">Paid Member Seats</label>
              <input
                type="number"
                min={minSeats}
                max={100}
                value={paidMemberSeats}
                onChange={(e) => setPaidMemberSeats(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50"
              />
              <p className="mt-2 text-[10px] font-bold text-white/25">{billingInterval === "month" ? "Monthly" : "Yearly"} plans require at least {minSeats} member seats.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-black text-[#021a1d] transition-all hover:bg-cyan-400 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Organization
          </button>
        </form>
      </div>
    </div>
  );
}

function OrganizationCard({ organization }: { organization: OrganizationSummary }) {
  const capacityPct = organization.paid_member_seats > 0
    ? Math.min(100, Math.round((organization.current_occupancy / organization.paid_member_seats) * 100))
    : 0;

  return (
    <Link href={`/admin/organizations/${organization.organization_id}`} className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-cyan-500/25 hover:bg-white/[0.04]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-white">{organization.name}</h3>
          <p className="mt-1 truncate text-xs font-medium text-white/35">{organization.owner?.email}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-white/15 transition-colors group-hover:text-cyan-400" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${statusClasses(organization.lifecycle_status)}`}>
          {label(organization.lifecycle_status)}
        </span>
        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
          {organization.billing_source}
        </span>
        {organization.can_manage_members ? (
          <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-green-400">Members Enabled</span>
        ) : (
          <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-400">Members Locked</span>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-white/30">Seats</span>
          <span className="text-white/60">{organization.current_occupancy}/{organization.paid_member_seats}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${capacityPct}%` }} />
        </div>
      </div>
    </Link>
  );
}

export default function OrganizationsClient({
  data,
  error,
  currentPage,
  search,
  lifecycleStatus,
  billingSource,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / (data?.limit || 20))), [data]);

  const updateFilters = (next: Partial<{ search: string; lifecycle_status: string; billing_source: string; page: string }>) => {
    const params = new URLSearchParams();
    const values = {
      search,
      lifecycle_status: lifecycleStatus,
      billing_source: billingSource,
      page: currentPage.toString(),
      ...next,
    };
    if (values.search) params.set("search", values.search);
    if (values.lifecycle_status) params.set("lifecycle_status", values.lifecycle_status);
    if (values.billing_source) params.set("billing_source", values.billing_source);
    if (values.page && values.page !== "1") params.set("page", values.page);
    router.push(`/admin/organizations${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main className="min-h-screen p-6 text-white lg:p-10">
      <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">Organizations</p>
          <h1 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-3xl font-black text-transparent">Manual Organization Plans</h1>
          <p className="mt-1 text-sm font-medium text-white/30">Provision organizations, invite owners, and manage paid member seats.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#021a1d] hover:bg-cyan-400">
          <Plus className="h-4 w-4" />
          New Organization
        </button>
      </header>

      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateFilters({ search: localSearch.trim(), page: "1" });
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search organization or owner email..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50"
            />
          </form>
          <div className="relative">
            <select value={lifecycleStatus} onChange={(e) => updateFilters({ lifecycle_status: e.target.value, page: "1" })} className="appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-bold text-white outline-none">
              {lifecycleOptions.map((option) => <option key={option || "all"} value={option} className="bg-[#050a0f] capitalize">{label(option)}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
          <div className="relative">
            <select value={billingSource} onChange={(e) => updateFilters({ billing_source: e.target.value, page: "1" })} className="appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm font-bold text-white outline-none">
              {billingOptions.map((option) => <option key={option || "all"} value={option} className="bg-[#050a0f] capitalize">{label(option)}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <Building2 className="mb-3 h-5 w-5 text-cyan-400" />
          <p className="text-2xl font-black text-cyan-400">{data?.total ?? 0}</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">Organizations</p>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
          <CheckCircle2 className="mb-3 h-5 w-5 text-green-400" />
          <p className="text-2xl font-black text-green-400">{data?.organizations.filter((org) => org.can_manage_members).length ?? 0}</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">Ready To Manage</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
          <Users className="mb-3 h-5 w-5 text-violet-400" />
          <p className="text-2xl font-black text-violet-400">{data?.organizations.reduce((sum, org) => sum + org.current_occupancy, 0) ?? 0}</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">Occupied Member Seats</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-5">
        {data && data.organizations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.organizations.map((organization) => <OrganizationCard key={organization.organization_id} organization={organization} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-white/10" />
            <p className="text-sm font-black uppercase tracking-widest text-white/20">No organizations found</p>
          </div>
        )}
      </div>

      {data && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-bold text-white/30">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={currentPage <= 1} onClick={() => updateFilters({ page: (currentPage - 1).toString() })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/60 disabled:opacity-30">Previous</button>
            <button disabled={currentPage >= totalPages} onClick={() => updateFilters({ page: (currentPage + 1).toString() })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/60 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {showCreate && <CreateOrganizationModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
