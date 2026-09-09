import { NextResponse } from "next/server";

const answerLabels = ["a", "b", "c", "d"] as const;
type AnswerLabel = (typeof answerLabels)[number];

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  return configured.replace(/^http:(?!\/\/)/, "http://").replace(/\/$/, "");
}

function normalizeAnswerText(value: unknown) {
  return value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") || "";
}

function parseCorrectAnswer(rawAnswer: unknown, choiceValues: unknown[]): AnswerLabel | null {
  const normalizedAnswer = normalizeAnswerText(rawAnswer);
  if (!normalizedAnswer) return null;

  const exactLabel = normalizedAnswer.match(/^(?:option\s*)?[\(\[]?([a-d])[\)\].:]?$/);
  if (exactLabel) return exactLabel[1] as AnswerLabel;

  const answerByText = answerLabels.find(
    (_label, choiceIndex) => normalizeAnswerText(choiceValues[choiceIndex]) === normalizedAnswer
  );
  if (answerByText) return answerByText;

  const optionPrefix = normalizedAnswer.match(/^(?:option\s*)?[\(\[]?([a-d])[\)\].:]\s+/);
  if (optionPrefix) return optionPrefix[1] as AnswerLabel;

  return null;
}

function getAssessmentContent(data: any) {
  return data?.assessment?.assessment || data?.assessment || data;
}

async function fetchAssessmentForScoring(apiBase: string, accessCode: string) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const urls = [
    `${apiBase}/v1/access_codes/${accessCode}`,
    `${apiBase}/v1/assessments/access_code/${accessCode}`,
  ];

  for (const url of urls) {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) continue;

    const data = await res.json();
    const assessment = getAssessmentContent(data);
    if (Array.isArray(assessment?.questions)) return assessment;
  }

  return null;
}

function calculateScore(assessment: any, responses: Record<string, string>) {
  const questions = Array.isArray(assessment?.questions) ? assessment.questions : [];
  if (questions.length === 0) return null;

  let correct = 0;
  let knownAnswers = 0;

  questions.forEach((question: any, index: number) => {
    const rawChoices = question.student_view?.choices;
    const choiceValues = Array.isArray(rawChoices)
      ? rawChoices
      : [question.a, question.b, question.c, question.d];
    const rawAnswer =
      question.answer ??
      question.teacher_metadata?.correct_answer ??
      question.correct_answer ??
      question.correctAnswer ??
      question.student_view?.answer;
    const correctAnswer = parseCorrectAnswer(rawAnswer, choiceValues);
    if (!correctAnswer) return;

    knownAnswers++;

    const questionId = question.question_id?.toString();
    const selectedAnswer = normalizeAnswerText(
      (questionId ? responses[questionId] : undefined) ??
      responses[index.toString()]
    );

    if (selectedAnswer === correctAnswer) correct++;
  });

  if (knownAnswers === 0) return null;
  return Math.round((correct / questions.length) * 100);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const API_BASE = getApiBase();
    const url = `${API_BASE}/v1/assessment_results/access_code/`;
    const score = await fetchAssessmentForScoring(API_BASE, body.access_code)
      .then((assessment) => assessment ? calculateScore(assessment, body.responses || {}) : null)
      .catch((error) => {
        console.error("[Proxy POST] Failed to calculate score:", error);
        return null;
      });
    const payload = typeof score === "number" ? { ...body, score } : body;

    console.log(`[Proxy POST] Submitting to backend: ${url}`);
    console.log(`[Proxy POST] Payload:`, JSON.stringify(payload, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Proxy POST] Backend error ${res.status}:`, errorText);
      return NextResponse.json(
        {
          error: "Failed to submit assessment results",
          debug: {
            status: res.status,
            url,
            backendBody: payload,
            backendResponse: errorText
          }
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(typeof score === "number" ? { ...data, score } : data);
  } catch (error: any) {
    console.error(`[Proxy POST] Critical error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
