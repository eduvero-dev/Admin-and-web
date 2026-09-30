"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getFreshAdminToken } from "@/lib/admin-auth";
import {
  ApiRequestError,
  cancelReferralDraw,
  configureReferralGiftCard,
  createReferralDraw,
  disqualifyReferralWinner,
  executeReferralDraw,
  freezeReferralDraw,
  updateReferralDraw,
} from "@/lib/api";
import {
  AdminReferralDraw,
  CreateReferralDrawPayload,
  UpdateReferralDrawPayload,
} from "@/lib/types";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number; detail?: string };

function actionError(
  error: unknown,
): Extract<ActionResult<never>, { ok: false }> {
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

async function requireAdmin() {
  const authState = await auth();
  if (!authState.userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(authState.userId);
  if ((user.publicMetadata as { role?: string })?.role !== "admin") {
    throw new Error("Admin access required");
  }
  return { token: await getFreshAdminToken(authState) };
}

async function run<T>(
  operation: (token: string | null) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const { token } = await requireAdmin();
    const data = await operation(token);
    revalidatePath("/admin/referral-draws", "layout");
    return { ok: true, data };
  } catch (error) {
    return actionError(error);
  }
}

export async function createReferralDrawAction(
  payload: CreateReferralDrawPayload,
): Promise<ActionResult<AdminReferralDraw>> {
  return run((token) => createReferralDraw(token, payload));
}

export async function updateReferralDrawAction(input: {
  drawId: string | number;
  payload: UpdateReferralDrawPayload;
}): Promise<ActionResult<AdminReferralDraw>> {
  return run((token) => updateReferralDraw(token, input.drawId, input.payload));
}

export async function cancelReferralDrawAction(input: {
  drawId: string | number;
  reason: string;
}) {
  return run((token) =>
    cancelReferralDraw(token, input.drawId, input.reason.trim()),
  );
}

export async function freezeReferralDrawAction(drawId: string | number) {
  return run((token) => freezeReferralDraw(token, drawId));
}

export async function executeReferralDrawAction(input: {
  drawId: string | number;
  redraw?: boolean;
}) {
  return run((token) => executeReferralDraw(token, input.drawId, input.redraw));
}

export async function configureReferralGiftCardAction(input: {
  drawId: string | number;
  claimCode: string;
}) {
  return run((token) =>
    configureReferralGiftCard(token, input.drawId, input.claimCode.trim()),
  );
}

export async function disqualifyReferralWinnerAction(input: {
  drawId: string | number;
  reason: string;
}) {
  return run((token) =>
    disqualifyReferralWinner(token, input.drawId, input.reason.trim()),
  );
}
