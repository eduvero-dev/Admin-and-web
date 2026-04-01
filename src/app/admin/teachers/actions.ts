"use server";

import { auth } from "@clerk/nextjs/server";
import { getAssessmentDetail, getStrategyDetail, getLessonPlanDetail } from "@/lib/api";

export async function fetchAssessmentDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const token = await auth().then(a => a.getToken());
  return getAssessmentDetail(token, userId, id);
}

export async function fetchStrategyDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const token = await auth().then(a => a.getToken());
  return getStrategyDetail(token, userId, id);
}

export async function fetchLessonPlanDetail(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const token = await auth().then(a => a.getToken());
  return getLessonPlanDetail(token, userId, id);
}
