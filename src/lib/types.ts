// Types mirroring the mobile app's assessment structures

export interface QuestionOption {
  id: string;
  label: "a" | "b" | "c" | "d";
  text: string;
}

export interface Question {
  id: string;
  text: string;
  correctAnswer: "a" | "b" | "c" | "d";
  options: QuestionOption[];
}

export interface Assessment {
  id: string;
  assessment_id: string;
  title: string;
  passage?: string | null;
  class_id?: string;
  questions: Question[];
}

export interface SubmitResultsPayload {
  access_code: string;
  assessment_id: number;
  class_id: number;
  date_administered: string;
  score: number;
  submitted: string;
  responses: Record<string, string>; // question_id -> selected option label
}
