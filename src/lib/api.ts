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
  SubscriptionPlansResponse
} from "./types";

function transformAssessmentJson(data: any, assessmentId: string): Assessment {
  const questions = data.questions.map((q: any, index: number) => {
    const answerMatch = q.answer?.toString().toLowerCase().match(/[a-d]/);
    const parsedAnswer = answerMatch ? answerMatch[0] : "a";
    return {
      id: `q_${assessmentId}_${index}`,
      text: q.question,
      correctAnswer: parsedAnswer as "a" | "b" | "c" | "d",
      options: [
        { id: `opt_${assessmentId}_${index}_a`, label: "a" as const, text: q.a },
        { id: `opt_${assessmentId}_${index}_b`, label: "b" as const, text: q.b },
        { id: `opt_${assessmentId}_${index}_c`, label: "c" as const, text: q.c },
        { id: `opt_${assessmentId}_${index}_d`, label: "d" as const, text: q.d },
      ],
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
  const classId = data.assessment?.class_id || data.access_code?.class_id;
  if (classId) transformed.class_id = classId.toString();

  // Add read_aloud and duration_minutes from the parent response
  transformed.read_aloud = data.read_aloud ?? false;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/analytics/dashboard`;
  console.log(`[API] Fetching dashboard analytics from: ${url}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (userId) {
    headers['X-Clerk-User-Id'] = userId;
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

export async function getFeedbacks(token?: string | null, userId?: string | null, limit: number = 20, offset: number = 0): Promise<FeedbackResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/feedbacks?limit=${limit}&offset=${offset}`;

  console.log(`[API] Fetching feedbacks from: ${url}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-Clerk-User-Id'] = userId;
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

export async function getTeachers(token?: string | null, userId?: string | null, limit: number = 20, offset: number = 0): Promise<TeacherListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/teachers?limit=${limit}&offset=${offset}`;

  console.log(`[API] Fetching teachers from: ${url}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-Clerk-User-Id'] = userId;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/teachers/${teacherId}`;

  console.log(`[API] Fetching teacher details from: ${url}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-Clerk-User-Id'] = userId;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/assessments/${assessmentId}`;
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-Clerk-User-Id'] = userId;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch assessment detail");
  return res.json();
}

export async function getStrategyDetail(token: string | null, userId: string | null, strategyId: string): Promise<StrategyDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/strategies/${strategyId}`;
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-Clerk-User-Id'] = userId;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch strategy detail");
  return res.json();
}

export async function getLessonPlanDetail(token: string | null, userId: string | null, lessonId: string): Promise<LessonPlanDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
  const url = `${baseUrl}/v1/admin/lesson-plans/${lessonId}`;
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-Clerk-User-Id'] = userId;

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

  if (params.userId) {
    headers["X-Clerk-User-Id"] = params.userId;
  }

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
