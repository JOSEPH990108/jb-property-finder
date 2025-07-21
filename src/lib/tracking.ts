// src/lib/tracking.ts

import ReactGA from "react-ga4";

// --- Google Analytics Measurement ID ---
// Set NEXT_PUBLIC_GA_ID in your .env file for this to work!
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/**
 * Initializes Google Analytics 4 if an ID is set.
 * Safe to call multiple times (GA will handle internally).
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

/**
 * Tracks a single page view to GA4.
 * Call this on every client-side route change.
 */
export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.send({ hitType: "pageview", page: url });
};
