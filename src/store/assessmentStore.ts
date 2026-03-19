import { create } from "zustand";
import { Assessment } from "@/lib/types";

interface AssessmentStore {
  // Assessment data
  assessment: Assessment | null;
  accessCode: string;
  studentName: string;
  
  // Answers: questionId -> option label
  answers: Record<string, string>;
  
  // Anti-cheat
  tabSwitchCount: number;
  autoSubmitted: boolean;
  
  // UI state
  currentQuestionIndex: number;
  submitted: boolean;
  score: number | null;

  // Actions
  setAssessment: (a: Assessment) => void;
  setAccessCode: (code: string) => void;
  setStudentName: (name: string) => void;
  setAnswer: (questionId: string, option: string) => void;
  incrementTabSwitch: () => void;
  setAutoSubmitted: (val: boolean) => void;
  setCurrentQuestionIndex: (i: number) => void;
  setSubmitted: (val: boolean) => void;
  setScore: (score: number) => void;
  reset: () => void;
}

const initialState = {
  assessment: null,
  accessCode: "",
  studentName: "",
  answers: {},
  tabSwitchCount: 0,
  autoSubmitted: false,
  currentQuestionIndex: 0,
  submitted: false,
  score: null,
};

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  ...initialState,

  setAssessment: (assessment) => set({ assessment }),
  setAccessCode: (accessCode) => set({ accessCode }),
  setStudentName: (studentName) => set({ studentName }),
  setAnswer: (questionId, option) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: option } })),
  incrementTabSwitch: () =>
    set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 })),
  setAutoSubmitted: (autoSubmitted) => set({ autoSubmitted }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setSubmitted: (submitted) => set({ submitted }),
  setScore: (score) => set({ score }),
  reset: () => set(initialState),
}));
