// src\lib\tracking.ts
import ReactGA from "react-ga4";

// Your real GA ID from Google Analytics
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const initGA = () => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID) return;
  ReactGA.send({ hitType: "pageview", page: url });
};
