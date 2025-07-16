// app/components/utils/AuthHydration.tsx

"use client";

import { useEffect } from "react";
import { useAuthStore, User } from "@/stores/authStore";

export default function AuthHydration({ user }: { user: User | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (user) {
      console.log("User from AuthHydration", user);
      setUser(user);
    }
  }, [user]);

  return null;
}
