import { Assessment, DashboardAnalytics, FeedbackResponse, SubmitResultsPayload } from "./types";

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

export async function getDashboardAnalytics(token?: string | null): Promise<DashboardAnalytics> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
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

export async function getFeedbacks(token?: string | null, limit: number = 20, offset: number = 0): Promise<FeedbackResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://spiced-cider-staging.up.railway.app";
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
