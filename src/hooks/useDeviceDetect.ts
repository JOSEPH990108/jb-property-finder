// src\hooks\useDeviceDetect.ts

/**
 * useDeviceDetect Hook
 * --------------------
 * Returns true if the current device is likely mobile.
 * - Uses userAgent *and* window size for detection
 * - Live updates on resize (SSR safe)
 * - Great for conditional rendering, mobile-first UI, etc.
 */

import { useEffect, useState } from "react";

const MOBILE_UA_REGEX = /iPhone|iPad|iPod|Android/i;
const MOBILE_SCREEN_MAX = 768;

export function useDeviceDetect(): boolean {
  // Initialize based on SSR-safe check
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false; // SSR fallback
    const userAgent = navigator.userAgent;
    const isMobileUA = MOBILE_UA_REGEX.test(userAgent);
    const isSmallScreen = window.innerWidth <= MOBILE_SCREEN_MAX;
    return isMobileUA || isSmallScreen;
  });

  useEffect(() => {
    const handleResize = () => {
      const userAgent = navigator.userAgent;
      const isMobileUA = MOBILE_UA_REGEX.test(userAgent);
      const isSmallScreen = window.innerWidth <= MOBILE_SCREEN_MAX;
      const shouldBeMobile = isMobileUA || isSmallScreen;
      setIsMobile((prev) => (prev !== shouldBeMobile ? shouldBeMobile : prev));
    };

    window.addEventListener("resize", handleResize);

    // Run once in case screen size changes before effect runs
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

