import { Assessment, SubmitResultsPayload } from "./types";

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
