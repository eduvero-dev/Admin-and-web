import "server-only";

const answerLabels = ["a", "b", "c", "d"] as const;
type AnswerLabel = (typeof answerLabels)[number];

export interface AssessmentCheckResult {
  total: number;
  answered: number;
  unanswered: number;
  incorrect: number;
  missed: number;
  correct: number;
  score: number | null;
}

export function getApiBase() {
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

export async function fetchAssessmentForScoring(apiBase: string, accessCode: string) {
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

export function calculateAssessmentCheck(
  assessment: any,
  responses: Record<string, string>
): AssessmentCheckResult | null {
  const questions = Array.isArray(assessment?.questions) ? assessment.questions : [];
  if (questions.length === 0) return null;

  let correct = 0;
  let incorrect = 0;
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

    if (!selectedAnswer) return;
    if (selectedAnswer === correctAnswer) correct++;
    else incorrect++;
  });

  const answered = Object.keys(responses).filter((key) => responses[key]).length;
  const unanswered = Math.max(questions.length - answered, 0);
  const missed = unanswered + incorrect;

  return {
    total: questions.length,
    answered,
    unanswered,
    incorrect,
    missed,
    correct,
    score: knownAnswers > 0 ? Math.round((correct / questions.length) * 100) : null,
  };
}
