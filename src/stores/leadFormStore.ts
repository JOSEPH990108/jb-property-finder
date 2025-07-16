// stores/leanFormStore.ts

import { create } from "zustand";

interface LeadFormState {
  open: boolean;
  projectName: string | null;
  openForm: (projectName?: string) => void;
  closeForm: () => void;
}

export const useLeadFormStore = create<LeadFormState>((set) => ({
  open: false,
  projectName: null,
  openForm: (projectName = "") =>
    set({ open: true, projectName: projectName || null }),
  closeForm: () => set({ open: false, projectName: null }),
}));
