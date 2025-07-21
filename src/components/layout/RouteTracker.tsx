// src\components\layout\RouteTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/tracking";
import { useConsentStore } from "@/stores/consentStore";

/**
 * RouteTracker
 * ------------
 * Auto-tracks GA4 page views *if* user has accepted analytics cookies.
 * Just slap this once in your layout (or _app).
 *
 * Smart: Handles Next.js client-side routing (SPA-style page views).
 */
export default function RouteTracker() {
  const pathname = usePathname(); // Dynamically changes on route push/replace
  const { accepted } = useConsentStore(); // User’s cookie consent for tracking

  useEffect(() => {
    // Only fire tracking if user has opted in (for GDPR vibes)
    if (accepted) trackPageView(pathname);
  }, [pathname, accepted]);

  return null; // Nothing rendered, just side effect
}
