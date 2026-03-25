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

export interface AnalyticsOverview {
  total_teachers: number;
  total_assessments: number;
  total_assessment_results: number;
  total_strategies: number;
  total_lesson_plans: number;
  total_feedbacks: number;
  total_class_periods: number;
  total_friendships: number;
  total_chat_messages: number;
}

export interface DashboardAnalytics {
  overview: AnalyticsOverview;
  recent_signups: number;
  teachers_by_state: Record<string, number>;
  teachers_by_school_type: Record<string, number>;
  teachers_by_grade_level: Record<string, number>;
  assessments_by_subject: Record<string, number>;
  teacher_growth: any[];
}

export interface Feedback {
  feedback_id: string;
  details: string;
  inserted_at: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
}

export interface FeedbackResponse {
  total: number;
  limit: number;
  offset: number;
  feedbacks: Feedback[];
}
