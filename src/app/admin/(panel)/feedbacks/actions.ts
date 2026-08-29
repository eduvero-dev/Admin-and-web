"use server";

import { auth } from "@clerk/nextjs/server";
import { updateFeedbackStatus } from "@/lib/api";
import { getFreshAdminToken } from "@/lib/admin-auth";

export async function setFeedbackStatus(
  feedbackId: string,
  status: "pending" | "in review" | "resolved"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const token = await getFreshAdminToken();
  return updateFeedbackStatus(token, userId, feedbackId, status);
}
