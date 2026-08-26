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

export type ReadAloudType = "none" | "questions_and_options" | "all";

export interface RosterStudent {
  name: string;
  roll_number: string;
}

export interface Assessment {
  id: string;
  assessment_id: string;
  title: string;
  passage?: string | null;
  class_id?: string;
  questions: Question[];
  read_aloud?: ReadAloudType;
  duration_minutes?: number | null;
  roster?: RosterStudent[];
}

export interface SubmitResultsPayload {
  access_code: string;
  assessment_id: number;
  class_id: number;
  date_administered: string;
  score: number;
  submitted: string;
  responses: Record<string, string>; // question_id -> selected option label
  roll_number?: string;
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
  screenshot_urls: string[];
  inserted_at: string;
  status: "pending" | "in review" | "resolved";
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

export interface TeacherSummary {
  teacher_id: string;
  name: string;
  email: string;
  inserted_at: string;
  current_plan?: string;
  completed_onboarding?: boolean;
  deactivated?: boolean;
  organization_id?: number | null;
  organization_name?: string | null;
  organization_role?: string | null;
  pending_organization_id?: number | null;
  eligible_for_organization?: boolean;
  ineligibility_reason?: string | null;
}

export interface TeacherListResponse {
  total: number;
  limit: number;
  offset: number;
  teachers: TeacherSummary[];
}

export interface ClassPeriod {
  class_id: number;
  name: string;
  num_students: number;
}

export interface TeacherAssessment {
  assessment_id: number;
  name: string;
}

export interface TeacherStrategy {
  strategy_id: number;
  title: string;
}

export interface TeacherLessonPlan {
  lesson_plan_id: number;
  title: string;
}

export interface AssessmentDetail {
  assessment_id: number;
  teacher_id: string;
  name: string;
  subject: string;
  sub_content: string;
  grade_level: number;
  num_questions: number;
  assessment: any;
  inserted_at: string;
  updated_at: string;
}

export interface StrategyDetail {
  strategy_id: number;
  teacher_id: string;
  title: string;
  description: string;
  strategy_type: string;
  curriculum: string;
  subject: string;
  subdomain: string;
  performance_tier: string;
  scaffold_support: string;
  implementation_hint: string;
  student_needs: string;
  inserted_at: string;
  updated_at: string;
}

export interface LessonPlanDetail {
  lesson_plan_id: number;
  teacher_id: string;
  title: string;
  description: string;
  lesson_plan: string;
  usage_tags: string[];
  class_ids: number[];
  inserted_at: string;
  updated_at: string;
}

export interface TeacherDetail {
  teacher_id: string;
  name: string;
  email: string;
  inserted_at: string;
  updated_at: string;
  completed_onboarding: boolean;
  deactivated: boolean;
  grade_level: number;
  years_teaching: number;
  years_teaching_current_grade_level: number;
  school_type: string;
  state: string;
  school_name: string | null;
  school_model: string | null;
  curriculum: string | null;
  subjects_taught: string[] | null;
  total_assessments: number;
  total_strategies: number;
  total_lesson_plans: number;
  total_assessment_results: number;
  total_class_periods: number;
  class_periods?: ClassPeriod[];
  assessments?: TeacherAssessment[];
  strategies?: TeacherStrategy[];
  lesson_plans?: TeacherLessonPlan[];
}

export interface SubscriptionPlan {
  plan_name: string;
  price_id: string;
  price_amount: string;
  billing_period: string;
  features: string[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface AIUsageCall {
  id: number;
  teacher_id: string;
  feature_name: string;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  inserted_at: string;
}

export interface AIUsageUser {
  teacher_id: string;
  total_tokens: number;
  calls: AIUsageCall[];
}

export interface AIUsageResponse {
  total: number;
  limit: number;
  offset: number;
  users: AIUsageUser[];
}

export interface AIUsageCallsResponse {
  total: number;
  limit: number;
  offset: number;
  calls: AIUsageCall[];
}

export type OrganizationLifecycleStatus =
  | "pending_owner"
  | "pending_onboarding"
  | "active"
  | "inactive";

export type OrganizationBillingSource = "manual" | "stripe";
export type OrganizationBillingInterval = "month" | "year";

export interface OrganizationOwner {
  teacher_id: string | null;
  email: string;
  name: string | null;
  completed_onboarding: boolean;
  deactivated: boolean;
  invitation_id: number | null;
  invitation_status: string | null;
  email_delivery_status: string | null;
}

export interface OrganizationMemberRecord {
  invite_id: number;
  organization_id: number;
  teacher_id: string | null;
  status: string;
  inserted_at: string;
  joined_at: string | null;
  record_type: "member" | "invitation";
  invitation_role: "member" | "owner" | null;
  claim_mode: string | null;
  source: string | null;
  email_delivery_status: string | null;
  organization_name: string | null;
  teacher_email: string | null;
  teacher_name: string | null;
}

export interface OrganizationSummary {
  organization_id: number;
  name: string;
  lifecycle_status: OrganizationLifecycleStatus;
  billing_source: OrganizationBillingSource;
  plan_name: string;
  billing_interval: OrganizationBillingInterval;
  subscription_id: string | null;
  subscription_status: string | null;
  paid_member_seats: number;
  paid_members_cycle: number;
  current_occupancy: number;
  remaining_occupancy: number;
  is_active: boolean;
  can_manage_members: boolean;
  owner: OrganizationOwner;
  inserted_at: string;
  updated_at: string;
}

export interface OrganizationDetail extends OrganizationSummary {
  members: OrganizationMemberRecord[];
}

export interface OrganizationListResponse {
  total: number;
  limit: number;
  offset: number;
  organizations: OrganizationSummary[];
}

export interface CreateOrganizationPayload {
  name: string;
  owner_email: string;
  owner_name: string;
  plan_name: "Organization";
  billing_interval: OrganizationBillingInterval;
  paid_member_seats: number;
  idempotency_key: string;
}

export interface EmailInvitee {
  email: string;
  name?: string;
}

export interface OrganizationMembersPayload {
  teacher_ids: string[];
  email_invitees: EmailInvitee[];
  idempotency_key: string;
}

export interface OrganizationMembersResponse {
  organization_id: number;
  requested: number;
  added: number;
  invited: number;
  unchanged: number;
  failed: number;
  current_occupancy: number;
  remaining_occupancy: number;
  results: Array<{
    input_type: "teacher_id" | "email";
    status: string;
    teacher_id: string | null;
    email: string | null;
    name: string | null;
    member_id: number | null;
    invitation_id: number | null;
    reason_code: string | null;
    message: string | null;
  }>;
}
