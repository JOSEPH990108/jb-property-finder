// src\stores\consentStore.ts
import { create } from "zustand";

interface ConsentState {
  accepted: boolean;
  setAccepted: (value: boolean) => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  accepted: false,
  setAccepted: (value: boolean) => set({ accepted: value }),
}));
