// src\stores\quizStore.ts

import { create } from "zustand";

type Purpose = "Investment" | "Own Stay" | "Both";

type QuizData = {
  step: number;
  purpose?: Purpose;
  budget: [number, number];
  locations: string[];
  peopleCount?: string;
  priorities: string[];
};

type QuizStore = QuizData & {
  nextStep: () => void;
  prevStep: () => void;
  setData: (data: Partial<QuizData>) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizStore>((set) => ({
  step: 0,
  purpose: undefined,
  budget: [50000, 1000000],
  locations: [],
  peopleCount: undefined,
  priorities: [],
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
  setData: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      step: 0,
      purpose: undefined,
      budget: [50000, 1000000],
      locations: [],
      peopleCount: undefined,
      priorities: [],
    }),
}));
