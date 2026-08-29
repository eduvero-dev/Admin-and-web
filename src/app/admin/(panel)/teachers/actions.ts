"use server";

import { auth } from "@clerk/nextjs/server";
import { getAssessmentDetail, getStrategyDetail, getLessonPlanDetail, updateUserPlan } from "@/lib/api";
import { getFreshAdminToken } from "@/lib/admin-auth";

export async function fetchAssessmentDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const token = await getFreshAdminToken();
  return getAssessmentDetail(token, userId, id);
}

export async function fetchStrategyDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const token = await getFreshAdminToken();
  return getStrategyDetail(token, userId, id);
}

export async function fetchLessonPlanDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const token = await getFreshAdminToken();
  return getLessonPlanDetail(token, userId, id);
}

export async function updateTeacherPlan(
  clerkUserIds: string | string[],
  plan: "Freemium" | "Insight" | "Impact Pro"
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const token = await getFreshAdminToken();
    const result = await updateUserPlan(token, userId, clerkUserIds, plan);
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update user plan");
  }
}
