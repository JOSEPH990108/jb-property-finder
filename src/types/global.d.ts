// src/types/global.d.ts

// Ensures this file is treated as a module and doesn’t pollute the global scope.
export {};

/**
 * Adds global types for analytics tracking tools to the Window interface.
 *
 * - fbq: Facebook Pixel
 * - _fbq: Facebook fallback object
 * - TiktokAnalyticsObject, ttq: TikTok Pixel
 */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    TiktokAnalyticsObject?: string;
    ttq?: any;
  }
}
