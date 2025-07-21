// src/stores/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { AuthUser, AuthMethod } from "@/types/main";

/**
 * AuthState
 * ---------
 * Shape for all auth state & actions. Types only!
 */
type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  verificationId: string | null;

  // Auth actions
  fetchSessionUser: () => Promise<void>;
  sendOtp: (
    identifier: string,
    method: AuthMethod
  ) => Promise<{ success: boolean; verificationId?: string }>;
  verifyOtp: (
    otp: string,
    identifier: string
  ) => Promise<{ success: boolean; verificationToken?: string }>;
  register: (
    name: string,
    password: string,
    confirmPassword: string,
    verificationToken: string,
    method: AuthMethod,
    identifier: string
  ) => Promise<{ success: boolean }>;
  login: (
    identifier: string,
    password: string,
    method: AuthMethod
  ) => Promise<{ success: boolean }>;
  checkUserExists: (identifier: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

/**
 * Helper to wrap API calls for consistent loading/error management and toast feedback.
 */
async function handleApiCall<T>(
  set: (
    partial:
      | AuthState
      | Partial<AuthState>
      | ((state: AuthState) => AuthState | Partial<AuthState>),
    replace?: false | undefined
  ) => void,
  apiCall: () => Promise<T>,
  successMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  set({ isLoading: true, error: null });
  try {
    const data = await apiCall();
    if (successMessage) toast.success(successMessage);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    set({ error: message });
    toast.error(message);
    return { success: false, error: message };
  } finally {
    set({ isLoading: false });
  }
}

/**
 * Zustand Auth Store
 * ------------------
 * All authentication state/actions in one store.
 * - Handles: session user, OTP, registration, login, logout, errors, persistence.
 * - Only the user object is persisted (not loading/errors).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      verificationId: null,

      setUser: (user) => set({ user }),

      /**
       * Sends OTP to user (email or phone)
       */
      sendOtp: async (identifier, method) => {
        const { success, data } = await handleApiCall(
          set,
          async () => {
            const response = await fetch("/api/auth/send-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier, method }),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.message || "Failed to send OTP");
            return result;
          },
          `OTP sent to your ${method}`
        );

        if (success && data?.verificationId) {
          set({ verificationId: data.verificationId });
          return { success: true, verificationId: data.verificationId };
        }
        return { success: false };
      },

      /**
       * Verifies OTP for user
       */
      verifyOtp: async (otp, identifier) => {
        const { success, data } = await handleApiCall(
          set,
          async () => {
            const response = await fetch("/api/auth/verify-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ otp, identifier }),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.message || "OTP verification failed");
            return result;
          },
          "OTP verified successfully"
        );

        return success
          ? { success: true, verificationToken: data?.verificationToken }
          : { success: false };
      },

      /**
       * Checks if a user exists (for registration flow)
       */
      checkUserExists: async (identifier: string) => {
        try {
          const res = await fetch("/api/auth/check-user-exists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
          });
          const data = await res.json();
          return data.exists as boolean;
        } catch (err) {
          toast.error("Unable to check account. Please try again later.");
          return true; // Fail-safe: assume user exists to prevent re-registration on network error
        }
      },

      /**
       * Fetches user from session (runs on app mount/refresh)
       */
      fetchSessionUser: async () => {
        try {
          const res = await fetch("/api/auth/session");
          if (!res.ok) throw new Error("Session fetch failed");
          const data = await res.json();
          set({ user: data.user || null });
        } catch (err) {
          set({ user: null });
        }
      },

      /**
       * Registers new user
       */
      register: async (
        name,
        password,
        confirmPassword,
        verificationToken,
        method,
        identifier
      ) => {
        const { success, data } = await handleApiCall(
          set,
          async () => {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                password,
                confirmPassword,
                verificationToken,
                method,
                identifier,
              }),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.message || "Registration failed");
            if (!result.user)
              throw new Error("Registration response was invalid.");
            return result;
          },
          "Account created successfully!"
        );

        if (success && data?.user) {
          set({ user: data.user, verificationId: null });
        } else {
          set({ user: null });
        }
        return { success };
      },

      /**
       * Log in with identifier (email/phone) and password
       */
      login: async (identifier, password, method) => {
        const { success, data } = await handleApiCall(set, async () => {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password, method }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Login failed");
          if (!result.user) throw new Error("Login response was invalid.");
          return result;
        });

        if (success && data?.user) {
          set({ user: data.user });
        }
        return { success };
      },

      /**
       * Logs user out (removes cookie, clears state)
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          toast.success("Logged out successfully");
        } catch (error) {
          console.error("Logout failed:", error);
          toast.error("Logout failed. Please try again.");
        } finally {
          set({
            user: null,
            isLoading: false,
            error: null,
            verificationId: null,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist the user object, not the loading/error state!
      partialize: (state) => ({ user: state.user }),
    }
  )
);
