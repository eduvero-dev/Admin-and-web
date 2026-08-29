import {
  Assessment,
  DashboardAnalytics,
  FeedbackResponse,
  SubmitResultsPayload,
  TeacherListResponse,
  TeacherDetail,
  AssessmentDetail,
  StrategyDetail,
  LessonPlanDetail,
  SubscriptionPlansResponse,
  ReadAloudType,
  AIUsageResponse,
  AIUsageCallsResponse,
  QuestionOption,
  OrganizationListResponse,
  OrganizationDetail,
  CreateOrganizationPayload,
  OrganizationMembersPayload,
  OrganizationMembersResponse,
  OrganizationBillingSource,
  OrganizationLifecycleStatus
} from "./types";

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  return configured.replace(/^http:(?!\/\/)/, "http://").replace(/\/$/, "");
}

async function readError(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    return parsed.detail || parsed.message || parsed.error || text;
  } catch {
    return text;
  }
}

export class ApiRequestError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.detail = detail;
  }
}

function apiError(action: string, res: Response, detail: string) {
  return new ApiRequestError(`${action}: ${res.status} ${detail}`, res.status, detail);
}

function adminHeaders(token?: string | null, _userId?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

function transformAssessmentJson(data: any, assessmentId: string): Assessment {
  const questions = data.questions.map((q: any, index: number) => {
    const rawChoices = q.student_view?.choices;
    const choiceValues = Array.isArray(rawChoices)
      ? rawChoices
      : [q.a, q.b, q.c, q.d];
    const labels = ["a", "b", "c", "d"] as const;
    const answerText = (
      q.answer ??
      q.teacher_metadata?.correct_answer ??
      q.correct_answer ??
      q.correctAnswer ??
      q.student_view?.answer
    )?.toString();
    const answerMatch = answerText?.toLowerCase().match(/[a-d]/);
    const answerByText = labels.find(
      (label, choiceIndex) =>
        choiceValues[choiceIndex]?.toString().trim().toLowerCase() ===
        answerText?.trim().toLowerCase()
    );
    const parsedAnswer = answerMatch?.[0] || answerByText || "a";

    return {
      id: q.question_id?.toString() || `q_${assessmentId}_${index}`,
      text: q.student_view?.question_text || q.question,
      correctAnswer: parsedAnswer as "a" | "b" | "c" | "d",
      options: labels.map((label, choiceIndex) => ({
        id: `opt_${assessmentId}_${index}_${label}`,
        label,
        text: choiceValues[choiceIndex]?.toString() || "",
      })) satisfies QuestionOption[],
    };
  });

  return {
    id: `a_${assessmentId}`,
    assessment_id: assessmentId,
    title: data.title,
    passage: data.passage,
    questions,
  };
}

export async function getAssessmentByCode(accessCode: string): Promise<Assessment> {
  const res = await fetch(`/api/assessment/${accessCode}`);
  if (!res.ok) {
    let errorMessage = "Assessment not found";
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMessage = errorJson.error;
      if (errorJson.debug) console.warn("[API Debug]", errorJson.debug);
    } catch {
      // Fallback to generic message
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  const assessmentContent = data.assessment?.assessment || data.assessment;
  const assessmentId = data.assessment?.assessment_id || data.assessment_id || accessCode;

  if (!assessmentContent?.title) {
    throw new Error("Assessment content not found in response.");
  }

  const transformed = transformAssessmentJson(assessmentContent, assessmentId.toString());
  const classId = data.assessment?.class_id || data.access_code?.class_id || data.class_id;
  if (classId) transformed.class_id = classId.toString();
  const roster = data.roster || data.access_code?.roster;
  transformed.roster = Array.isArray(roster) ? roster : [];

  // Add read_aloud and duration_minutes from the parent response
  let readAloudVal: ReadAloudType = "none";
  if (
    data.read_aloud === true ||
    data.read_aloud === "Read aloud passage, questions, and answer choices" ||
    data.read_aloud === "all"
  ) {
    readAloudVal = "all";
  } else if (
    data.read_aloud === "Read aloud question and answer choices only" ||
    data.read_aloud === "questions_and_options"
  ) {
    readAloudVal = "questions_and_options";
  }
  transformed.read_aloud = readAloudVal;
  transformed.duration_minutes = data.duration_minutes ?? null;

  return transformed;
}

export async function submitAssessmentResults(payload: SubmitResultsPayload): Promise<any> {
  // Use the local Next.js API route as a proxy to bypass CORS
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to submit results via proxy");
  }
  return res.json();
}

export async function getDashboardAnalytics(token?: string | null, userId?: string | null): Promise<DashboardAnalytics> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/analytics/dashboard`;
  console.log(`[API] Fetching dashboard analytics from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error] Status: ${res.status}, Body: ${errorText}`);
    throw new Error(`Failed to fetch dashboard analytics: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function updateFeedbackStatus(
  token: string | null,
  userId: string | null,
  feedbackId: string,
  status: "pending" | "in review" | "resolved"
): Promise<{ message: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/feedbacks/${feedbackId}/status`;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update feedback status: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getFeedbacks(token?: string | null, userId?: string | null, limit: number = 20, offset: number = 0): Promise<FeedbackResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/feedbacks?limit=${limit}&offset=${offset}`;

  console.log(`[API] Fetching feedbacks from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error Feedbacks] Status: ${res.status}, Body: ${errorText}`);
    throw new Error(`Failed to fetch feedbacks: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getTeachers(
  token?: string | null,
  userId?: string | null,
  limit: number = 20,
  offset: number = 0,
  filters?: {
    organizationId?: number | string;
    email?: string;
    name?: string;
  }
): Promise<TeacherListResponse> {
  const baseUrl = getApiBase();
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (filters?.organizationId) params.set("organization_id", filters.organizationId.toString());
  if (filters?.email) params.set("email", filters.email);
  if (filters?.name) params.set("name", filters.name);
  const url = `${baseUrl}/v1/admin/teachers?${params.toString()}`;

  console.log(`[API] Fetching teachers from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error Teachers] Status: ${res.status}, Body: ${errorText}`);
    throw new Error(`Failed to fetch teachers: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getTeacherById(token: string | null, userId: string | null, teacherId: string): Promise<TeacherDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/teachers/${teacherId}`;

  console.log(`[API] Fetching teacher details from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error Teacher Detail] Status: ${res.status}, TeacherID: ${teacherId}, Body: ${errorText}`);
    throw new Error(`Failed to fetch teacher details: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getAssessmentDetail(token: string | null, userId: string | null, assessmentId: string): Promise<AssessmentDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/assessments/${assessmentId}`;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch assessment detail");
  return res.json();
}

export async function getStrategyDetail(token: string | null, userId: string | null, strategyId: string): Promise<StrategyDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/strategies/${strategyId}`;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch strategy detail");
  return res.json();
}

export async function getLessonPlanDetail(token: string | null, userId: string | null, lessonId: string): Promise<LessonPlanDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/lesson-plans/${lessonId}`;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch lesson plan detail");
  return res.json();
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_PAYMENTS_API_URL ||
    process.env.PAYMENTS_API_URL ||
    "https://spiced-cider-production.up.railway.app";

  const url = `${baseUrl}/v1/payments/plans`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch subscription plans: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function createStripeCheckout(params: {
  priceId: string;
  userId?: string | null;
}): Promise<{ checkout_url: string }> {
  const baseUrl =
    process.env.NEXT_PUBLIC_PAYMENTS_API_URL ||
    process.env.PAYMENTS_API_URL ||
    "https://spiced-cider-production.up.railway.app";

  const url = `${baseUrl}/v1/payments/checkout`;
  const headers: HeadersInit = {
    accept: "application/json",
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ price_id: params.priceId }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create checkout: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function updateUserPlan(
  token: string | null,
  userId: string | null,
  clerkUserIds: string | string[],
  plan: "Freemium" | "Insight" | "Impact Pro"
): Promise<{ updated_users?: any[]; message?: string }> {
  const baseUrl = "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/users/plan`;

  const ids = Array.isArray(clerkUserIds) ? clerkUserIds : [clerkUserIds];

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ clerk_user_ids: ids, plan }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update user plan: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getAIUsage(
  token: string | null,
  userId: string | null,
  limit: number = 50,
  offset: number = 0
): Promise<AIUsageResponse> {
  const baseUrl = "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/ai-usage/users?limit=${limit}&offset=${offset}`;

  console.log(`[API] Fetching AI usage from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error AI Usage] Status: ${res.status}, Body: ${errorText}`);
    throw new Error(`Failed to fetch AI usage: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getAIUsageCalls(
  token: string | null,
  userId: string | null,
  limit: number = 50,
  offset: number = 0
): Promise<AIUsageCallsResponse> {
  const baseUrl = "https://d3bqxy57prpkdk.cloudfront.net";
  const url = `${baseUrl}/v1/admin/ai-usage/calls?limit=${limit}&offset=${offset}`;

  console.log(`[API] Fetching AI usage calls from: ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error AI Usage Calls] Status: ${res.status}, Body: ${errorText}`);
    throw new Error(`Failed to fetch AI usage calls: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getOrganizations(
  token: string | null,
  userId: string | null,
  params: {
    limit?: number;
    offset?: number;
    search?: string;
    lifecycleStatus?: OrganizationLifecycleStatus | "";
    billingSource?: OrganizationBillingSource | "";
  } = {}
): Promise<OrganizationListResponse> {
  const baseUrl = getApiBase();
  const query = new URLSearchParams({
    limit: (params.limit ?? 20).toString(),
    offset: (params.offset ?? 0).toString(),
  });
  if (params.search) query.set("search", params.search);
  if (params.lifecycleStatus) query.set("lifecycle_status", params.lifecycleStatus);
  if (params.billingSource) query.set("billing_source", params.billingSource);

  const res = await fetch(`${baseUrl}/v1/admin/organizations?${query.toString()}`, {
    headers: adminHeaders(token, userId),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to fetch organizations", res, await readError(res));
  }

  return res.json();
}

export async function getOrganizationById(
  token: string | null,
  userId: string | null,
  organizationId: string | number
): Promise<OrganizationDetail> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations/${organizationId}`, {
    headers: adminHeaders(token, userId),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to fetch organization", res, await readError(res));
  }

  return res.json();
}

export async function createManualOrganization(
  token: string | null,
  userId: string | null,
  payload: CreateOrganizationPayload
): Promise<OrganizationDetail> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations`, {
    method: "POST",
    headers: adminHeaders(token, userId),
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to create organization", res, await readError(res));
  }

  return res.json();
}

export async function addOrganizationMembers(
  token: string | null,
  userId: string | null,
  organizationId: string | number,
  payload: OrganizationMembersPayload
): Promise<OrganizationMembersResponse> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations/${organizationId}/members`, {
    method: "POST",
    headers: adminHeaders(token, userId),
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to add members", res, await readError(res));
  }

  return res.json();
}

export async function removeOrganizationMember(
  token: string | null,
  userId: string | null,
  organizationId: string | number,
  teacherId: string
): Promise<{ status: string; message: string; organization_id: number }> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations/${organizationId}/members/${teacherId}`, {
    method: "DELETE",
    headers: adminHeaders(token, userId),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to remove member", res, await readError(res));
  }

  return res.json();
}

export async function cancelOrganizationInvite(
  token: string | null,
  userId: string | null,
  organizationId: string | number,
  invitationId: string | number
): Promise<{ status: string; message: string; organization_id: number }> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations/${organizationId}/invites/${invitationId}/cancel`, {
    method: "POST",
    headers: adminHeaders(token, userId),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to cancel invite", res, await readError(res));
  }

  return res.json();
}

export async function resendOrganizationInvite(
  token: string | null,
  userId: string | null,
  organizationId: string | number,
  invitationId: string | number
): Promise<{ status: string; invitation_id: number }> {
  const baseUrl = getApiBase();
  const res = await fetch(`${baseUrl}/v1/admin/organizations/${organizationId}/invites/${invitationId}/resend`, {
    method: "POST",
    headers: adminHeaders(token, userId),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw apiError("Failed to resend invite", res, await readError(res));
  }

  return res.json();
}
