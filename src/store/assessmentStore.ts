import { create } from "zustand";
import { Assessment, RosterStudent } from "@/lib/types";

interface AssessmentStore {
  // Assessment data
  assessment: Assessment | null;
  accessCode: string;
  studentName: string;
  selectedStudent: RosterStudent | null;

  // Question randomization: stores the randomized indices
  // e.g., [2, 0, 3, 1] means show question[2] first, question[0] second, etc.
  randomizedOrder: number[];

  // Answers: questionId -> option label
  answers: Record<string, string>;

  // Anti-cheat
  tabSwitchCount: number;
  autoSubmitted: boolean;

  // UI state
  currentQuestionIndex: number;
  submitted: boolean;
  score: number | null;

  // Read Aloud
  readAloudEnabled: boolean;

  // Actions
  setAssessment: (a: Assessment) => void;
  setAccessCode: (code: string) => void;
  setStudentName: (name: string) => void;
  setSelectedStudent: (student: RosterStudent | null) => void;
  setAnswer: (questionId: string, option: string) => void;
  incrementTabSwitch: () => void;
  setAutoSubmitted: (val: boolean) => void;
  setCurrentQuestionIndex: (i: number) => void;
  setSubmitted: (val: boolean) => void;
  setScore: (score: number) => void;
  setReadAloudEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  assessment: null,
  accessCode: "",
  studentName: "",
  selectedStudent: null,
  randomizedOrder: [],
  answers: {},
  tabSwitchCount: 0,
  autoSubmitted: false,
  currentQuestionIndex: 0,
  submitted: false,
  score: null,
  readAloudEnabled: false,
};

// Fisher-Yates shuffle algorithm for randomizing question order
function shuffleArray(array: number[]): number[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  ...initialState,

  setAssessment: (assessment) => {
    // Generate randomized order when assessment is set
    const order = assessment
      ? shuffleArray(Array.from({ length: assessment.questions.length }, (_, i) => i))
      : [];
    set({ assessment, randomizedOrder: order, selectedStudent: null, studentName: "" });
  },
  setAccessCode: (accessCode) => set({ accessCode }),
  setStudentName: (studentName) => set({ studentName }),
  setSelectedStudent: (selectedStudent) =>
    set({ selectedStudent, studentName: selectedStudent?.name ?? "" }),
  setAnswer: (questionId, option) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: option } })),
  incrementTabSwitch: () =>
    set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 })),
  setAutoSubmitted: (autoSubmitted) => set({ autoSubmitted }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setSubmitted: (submitted) => set({ submitted }),
  setScore: (score) => set({ score }),
  setReadAloudEnabled: (readAloudEnabled) => set({ readAloudEnabled }),
  reset: () => set(initialState),
}));
