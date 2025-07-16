// app/(auth)/login/page.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAuthClient } from "better-auth/client";
import PhoneInputSection from "@/components/form/PhoneInputSection";
import AnimatedFieldError from "@/components/form/AnimatedFieldError";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const router = useRouter();
  const authClient = createAuthClient();
  const { logout } = useAuthStore();

  // Use the custom hook to handle all form logic
  const {
    method,
    identifier,
    password,
    countryCode,
    showPassword,
    isLoading,
    formError,
    fieldErrors,
    setIdentifier,
    setPassword,
    setCountryCode,
    setShowPassword,
    handleMethodChange,
    handleSubmit,
  } = useLoginForm();

  // Handle social sign-in
  const handleSocialSignIn = async (provider: "google") => {
    await authClient.signIn.social({ provider });
    // Note: better-auth handles the redirect flow.
    // You might need to sync the session with your Zustand store afterwards.
  };

  // Handle logout and redirect
  const handleLogout = async () => {
    await logout();
    router.push("/login"); // Client-side navigation
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 px-4">
      <div className="w-full max-w-sm bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xl space-y-6 text-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold text-center">Welcome Back 👋</h2>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-2 text-sm border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => handleSocialSignIn("google")}
          disabled={isLoading}
        >
          <FcGoogle size={18} />
          Continue with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              or continue with
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={method === "email" ? "default" : "outline"}
            className="flex-1 rounded-md"
            onClick={() => handleMethodChange("email")}
          >
            Email
          </Button>
          <Button
            variant={method === "phone" ? "default" : "outline"}
            className="flex-1 rounded-md"
            onClick={() => handleMethodChange("phone")}
          >
            Phone
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "email" ? (
            <div>
              <Input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email address"
                className={`rounded-lg border ${
                  fieldErrors.identifier
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
                } dark:bg-gray-800`}
                disabled={isLoading}
              />
              <AnimatedFieldError message={fieldErrors.identifier} />
            </div>
          ) : (
            <PhoneInputSection
              phone={identifier}
              onPhoneChange={setIdentifier}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              error={fieldErrors.identifier}
              disabled={isLoading}
            />
          )}

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`pr-10 rounded-lg border ${
                fieldErrors.password
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
              } dark:bg-gray-800`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <AnimatedFieldError message={fieldErrors.password} />
          </div>

          <AnimatedFieldError message={formError} />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-sm text-center">
            <a
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
