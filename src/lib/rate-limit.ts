// src/lib/rate-limit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Redis client setup ---
// Be sure to set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// --- Ratelimiter setup ---
// Uses a sliding window: 5 requests per 10 seconds per IP
// .limit(ip) returns { success, limit, remaining, reset }
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true, // Collects Upstash analytics (optional)
  prefix: "ratelimit", // Namespace for your app (prevents collisions)
});
