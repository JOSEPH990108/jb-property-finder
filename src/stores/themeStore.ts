// src/stores/themeStore.ts

import { create } from "zustand";

/**
 * Theme
 * -----
 * The only themes supported. You can extend if you want "system" mode!
 */
export type Theme = "light" | "dark";

/**
 * ThemeState
 * ----------
 * - theme: current theme ("light" or "dark")
 * - toggleTheme: flips between light/dark
 * - setTheme: directly set the theme
 */
interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * useThemeStore
 * -------------
 * Global theme state for your app.
 * - Default is "light" (can be updated by ThemeProvider)
 * - Use anywhere: const { theme, toggleTheme } = useThemeStore();
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === "light" ? "dark" : "light";
    set({ theme: newTheme });
  },

  setTheme: (theme: Theme) => set({ theme }),
}));
