// src\app\api\auth\[...auth]\route.ts
import { auth } from "@/lib/auth/providers";

export const GET = (req: Request) => {
  console.log("✅ BetterAuth GET called:", req.url);
  return auth.handler(req);
};

export const POST = (req: Request) => {
  console.log("✅ BetterAuth POST called:", req.url);
  return auth.handler(req);
};
