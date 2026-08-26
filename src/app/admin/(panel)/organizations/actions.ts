"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  ApiRequestError,
  addOrganizationMembers,
  cancelOrganizationInvite,
  createManualOrganization,
  getTeachers,
  removeOrganizationMember,
  resendOrganizationInvite,
} from "@/lib/api";
import {
  OrganizationBillingInterval,
  OrganizationDetail,
  OrganizationMembersResponse,
  TeacherListResponse,
} from "@/lib/types";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number; detail?: string };

function actionError(error: unknown): Extract<ActionResult<never>, { ok: false }> {
  if (error instanceof ApiRequestError) {
    return {
      ok: false,
      error: error.message,
      status: error.status,
      detail: error.detail,
    };
  }

  return {
    ok: false,
    error: error instanceof Error ? error.message : "Action failed.",
  };
}

async function actionResult<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    return actionError(error);
  }
}

async function requireAdmin() {
  const authState = await auth();
  const { userId } = authState;
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== "admin") throw new Error("Admin access required");

  return {
    userId,
    token: await authState.getToken(),
  };
}

export async function createOrganizationAction(input: {
  name: string;
  ownerEmail: string;
  ownerName: string;
  billingInterval: OrganizationBillingInterval;
  paidMemberSeats: number;
  idempotencyKey: string;
}): Promise<ActionResult<OrganizationDetail>> {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    return createManualOrganization(token, userId, {
      name: input.name.trim(),
      owner_email: input.ownerEmail.trim(),
      owner_name: input.ownerName.trim(),
      plan_name: "Organization",
      billing_interval: input.billingInterval,
      paid_member_seats: input.paidMemberSeats,
      idempotency_key: input.idempotencyKey,
    });
  });
}

export async function searchOrganizationTeachersAction(input: {
  organizationId: number;
  query: string;
}): Promise<ActionResult<TeacherListResponse>> {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    const query = input.query.trim();
    return getTeachers(token, userId, 20, 0, {
      organizationId: input.organizationId,
      email: query.includes("@") ? query : undefined,
      name: query.includes("@") ? undefined : query,
    });
  });
}

export async function addOrganizationMembersAction(input: {
  organizationId: number;
  teacherIds: string[];
  emailInvitees: Array<{ email: string; name?: string }>;
  idempotencyKey: string;
}): Promise<ActionResult<OrganizationMembersResponse>> {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    return addOrganizationMembers(token, userId, input.organizationId, {
      teacher_ids: input.teacherIds,
      email_invitees: input.emailInvitees.map((invitee) => ({
        email: invitee.email.trim(),
        name: invitee.name?.trim() || undefined,
      })),
      idempotency_key: input.idempotencyKey,
    });
  });
}

export async function removeOrganizationMemberAction(input: {
  organizationId: number;
  teacherId: string;
}) {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    return removeOrganizationMember(token, userId, input.organizationId, input.teacherId);
  });
}

export async function cancelOrganizationInviteAction(input: {
  organizationId: number;
  invitationId: number;
}) {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    return cancelOrganizationInvite(token, userId, input.organizationId, input.invitationId);
  });
}

export async function resendOrganizationInviteAction(input: {
  organizationId: number;
  invitationId: number;
}) {
  return actionResult(async () => {
    const { token, userId } = await requireAdmin();
    return resendOrganizationInvite(token, userId, input.organizationId, input.invitationId);
  });
}
