// src\lib\otp-service.ts

import { AuthMethod } from "@/types/main";

export interface OtpDeliveryPayload {
  identifier: string;
  otp: string;
  method: AuthMethod;
}

export const sendOtpCode = async ({
  identifier,
  otp,
  method,
}: OtpDeliveryPayload): Promise<void> => {
  // TODO: Replace with real email/SMS service later
  console.log(`[MOCK] Sending OTP to ${method}: ${identifier} => OTP: ${otp}`);
};
