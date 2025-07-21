// src\hooks\useHydrated.ts

/**
 * useHydrated Hook
 * ---------------
 * Returns true only after the component has hydrated on the client.
 * Useful for SSR/Next.js: Hide client-only UI until after mount (avoid hydration mismatch).
 */

import { useEffect, useState } from "react";

export function useHydrated(): boolean {
  // State is false until first client-side render
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
