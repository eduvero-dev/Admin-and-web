"use server";

import { auth } from "@clerk/nextjs/server";
import { updateFeedbackStatus } from "@/lib/api";

export async function setFeedbackStatus(
  feedbackId: string,
  status: "pending" | "in review" | "resolved"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const token = await auth().then(a => a.getToken());
  return updateFeedbackStatus(token, userId, feedbackId, status);
}
