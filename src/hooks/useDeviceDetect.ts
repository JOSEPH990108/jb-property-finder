// src\hooks\useDeviceDetect.ts
import { useEffect, useState } from "react";

const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent;
    const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobileUserAgent || isSmallScreen;
  });

  useEffect(() => {
    const handleResize = () => {
      const userAgent = navigator.userAgent;
      const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const shouldBeMobile = isMobileUserAgent || isSmallScreen;

      // Only update if value actually changes
      setIsMobile((prev) => {
        if (prev !== shouldBeMobile) return shouldBeMobile;
        return prev;
      });
    };

    window.addEventListener("resize", handleResize);

    // Optional: Run once in case browser is resized before this effect runs
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export default useDeviceDetect;
