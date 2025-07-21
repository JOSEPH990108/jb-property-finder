// src/lib/otp-service.ts

import { AuthMethod } from "@/types/main";

/**
 * OtpDeliveryPayload
 * ------------------
 * The payload needed to send an OTP (email or SMS).
 */
export interface OtpDeliveryPayload {
  identifier: string;
  otp: string;
  method: AuthMethod;
}

/**
 * sendOtpCode
 * -----------
 * Mocks sending an OTP to a user (email or phone).
 * - Replace with real email/SMS integration for production.
 * - Safe for dev/staging, but won't actually deliver anything!
 */
export const sendOtpCode = async ({
  identifier,
  otp,
  method,
}: OtpDeliveryPayload): Promise<void> => {
  // TODO: Swap this for real email/SMS gateway before launch!
  console.log(`[MOCK] Sending OTP to ${method}: ${identifier} => OTP: ${otp}`);
};
