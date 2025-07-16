/// db/schema/_enums.ts
/// All PostgreSQL enums
import { pgEnum } from "drizzle-orm/pg-core";

export const projectAgentRoleEnum = pgEnum("project_agent_role", [
  "AGENT",
  "PRIMARY",
  "SUPERVISOR",
]);

export const otpTypeEnum = pgEnum("otp_type", [
  "REGISTER",
  "LOGIN",
  "FORGOT_PASSWORD",
]);
