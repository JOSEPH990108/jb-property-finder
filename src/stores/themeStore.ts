import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light", // Default; actual applied theme set in ThemeProvider

  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === "light" ? "dark" : "light";
    set({ theme: newTheme });
  },

  setTheme: (theme: Theme) => {
    set({ theme });
  },
}));
