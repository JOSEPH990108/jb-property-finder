// src\components\utils\AuthHydration.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types/db";

// This is the shape of the data we expect from our /api/auth/session endpoint
interface SessionData {
  user: User;
}

export function AuthHydration() {
  const { setUser, isLoading } = useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data: SessionData = await res.json();
          // If we get a user, set it in the store
          if (data.user) {
            setUser(data.user);
          } else {
            // If no user, set the user to null
            setUser(null);
          }
        } else {
          // If the request fails (e.g., 401 Unauthorized), there's no session
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUser(null); // Ensure loading stops on error
      }
    };

    getSession();
  }, [setUser]); // Dependency array ensures this runs once on mount

  // You can optionally return a loading spinner for the whole app
  // if (isLoading) {
  //   return <GlobalSpinner />;
  // }

  return null; // This component does not render anything itself
}
