ALTER TABLE "user" ADD COLUMN "failedAttempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lockedUntil" timestamp;