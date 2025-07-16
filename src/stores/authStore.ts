// stores/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { AuthUser, AuthMethod } from "@/types/property"; // Assuming types are moved to a separate file for clarity

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  verificationId: string | null;

  // Actions
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
 * @description A helper function to wrap API calls, managing loading state and errors.
 * @param set - The Zustand set function.
 * @param apiCall - The async function that performs the API request.
 * @param successMessage - Optional success message for the toast.
 * @returns The result of the API call.
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      verificationId: null,

      setUser: (user) => set({ user }),

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
            // API should consistently return the user object on success
            if (!result.user)
              throw new Error("Registration response was invalid.");
            return result;
          },
          "Account created successfully!"
        );

        if (success && data?.user) {
          set({ user: data.user, verificationId: null });
        } else {
          set({ user: null }); // Clear any optimistic user data on failure
        }
        return { success };
      },

      login: async (identifier, password, method) => {
        const { success, data } = await handleApiCall(
          set,
          async () => {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier, password, method }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Login failed");
            // API should consistently return the user object on success
            if (!result.user) throw new Error("Login response was invalid.");
            return result;
          }
          // Success toast is handled in the component for better UX
        );

        if (success && data?.user) {
          set({ user: data.user });
        }
        return { success };
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          toast.success("Logged out successfully");
        } catch (error) {
          console.error("Logout failed:", error);
          toast.error("Logout failed. Please try again.");
        } finally {
          // This should be the single source of truth for user state.
          set({
            user: null,
            isLoading: false,
            error: null,
            verificationId: null,
          });
          // The component calling logout should handle the redirect.
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist the user object, not the entire state.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
