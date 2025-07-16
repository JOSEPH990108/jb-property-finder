CREATE TYPE "public"."otp_type" AS ENUM('REGISTER', 'LOGIN', 'FORGOT_PASSWORD');--> statement-breakpoint
CREATE TYPE "public"."project_agent_role" AS ENUM('AGENT', 'PRIMARY', 'SUPERVISOR');--> statement-breakpoint
CREATE TABLE "agency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"contact" text,
	"email" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "agency_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "agency_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"agencyId" integer NOT NULL,
	"userId" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"contact" text,
	"email" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "developer_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lead_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectAgentId" integer NOT NULL,
	"leadName" text NOT NULL,
	"contact" text NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"projectId" integer NOT NULL,
	"whatsappNumber" text NOT NULL,
	"role" "project_agent_role" DEFAULT 'AGENT' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"country" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp" (
	"id" text PRIMARY KEY NOT NULL,
	"verificationId" text NOT NULL,
	"identifier" text NOT NULL,
	"otp" text NOT NULL,
	"method" text NOT NULL,
	"type" "otp_type" NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "otp_verificationId_unique" UNIQUE("verificationId")
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"deviceId" text,
	"country" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"phone" text,
	"phoneVerified" boolean DEFAULT false NOT NULL,
	"password" text,
	"image" text,
	"isAgent" boolean DEFAULT false NOT NULL,
	"lastLogin" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "layout" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"name" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"studyRoom" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"squareFeet" integer NOT NULL,
	"spaPriceBumiMin" numeric(12, 2) NOT NULL,
	"spaPriceBumiMax" numeric(12, 2) NOT NULL,
	"spaPriceNonBumiMin" numeric(12, 2) NOT NULL,
	"spaPriceNonBumiMax" numeric(12, 2) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"fileUrl" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"projectId" integer NOT NULL,
	"layoutId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_feature" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"featureId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"isMain" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"projectId" integer NOT NULL,
	"layoutId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_video" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"isMain" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"projectId" integer NOT NULL,
	"layoutId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"developerId" integer NOT NULL,
	"areaId" integer NOT NULL,
	"propertyCategoryId" integer NOT NULL,
	"propertyTypeId" integer NOT NULL,
	"tenureTypeId" integer NOT NULL,
	"projectStatusId" integer NOT NULL,
	"projectTypeId" integer NOT NULL,
	"yearOfCompletion" integer,
	"description" text,
	"location" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "area_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "area_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "area" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"stateId" integer NOT NULL,
	"categoryId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "area_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "feature_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "project_status_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "project_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "property_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "property_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "property_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"propertyCategoryId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "property_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "state" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "state_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tenure_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "tenure_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "agency_agent" ADD CONSTRAINT "agency_agent_agencyId_agency_id_fk" FOREIGN KEY ("agencyId") REFERENCES "public"."agency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_agent" ADD CONSTRAINT "agency_agent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_assignment" ADD CONSTRAINT "lead_assignment_projectAgentId_project_agent_id_fk" FOREIGN KEY ("projectAgentId") REFERENCES "public"."project_agent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_agent" ADD CONSTRAINT "project_agent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_agent" ADD CONSTRAINT "project_agent_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layout" ADD CONSTRAINT "layout_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_layoutId_layout_id_fk" FOREIGN KEY ("layoutId") REFERENCES "public"."layout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_feature" ADD CONSTRAINT "project_feature_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_feature" ADD CONSTRAINT "project_feature_featureId_feature_id_fk" FOREIGN KEY ("featureId") REFERENCES "public"."feature"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_image" ADD CONSTRAINT "project_image_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_image" ADD CONSTRAINT "project_image_layoutId_layout_id_fk" FOREIGN KEY ("layoutId") REFERENCES "public"."layout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_video" ADD CONSTRAINT "project_video_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_video" ADD CONSTRAINT "project_video_layoutId_layout_id_fk" FOREIGN KEY ("layoutId") REFERENCES "public"."layout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_developerId_developer_id_fk" FOREIGN KEY ("developerId") REFERENCES "public"."developer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_areaId_area_id_fk" FOREIGN KEY ("areaId") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_propertyCategoryId_property_category_id_fk" FOREIGN KEY ("propertyCategoryId") REFERENCES "public"."property_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_propertyTypeId_property_type_id_fk" FOREIGN KEY ("propertyTypeId") REFERENCES "public"."property_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_tenureTypeId_tenure_type_id_fk" FOREIGN KEY ("tenureTypeId") REFERENCES "public"."tenure_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_projectStatusId_project_status_id_fk" FOREIGN KEY ("projectStatusId") REFERENCES "public"."project_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_projectTypeId_project_type_id_fk" FOREIGN KEY ("projectTypeId") REFERENCES "public"."project_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area" ADD CONSTRAINT "area_stateId_state_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."state"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area" ADD CONSTRAINT "area_categoryId_area_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."area_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_type" ADD CONSTRAINT "property_type_propertyCategoryId_property_category_id_fk" FOREIGN KEY ("propertyCategoryId") REFERENCES "public"."property_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agency_agent_agencyId_userId_index" ON "agency_agent" USING btree ("agencyId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "project_agent_userId_projectId_index" ON "project_agent" USING btree ("userId","projectId");--> statement-breakpoint
CREATE UNIQUE INDEX "otp_identifier_index" ON "otp" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_token_expiresAt_index" ON "password_reset_token" USING btree ("token","expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "project_feature_projectId_featureId_index" ON "project_feature" USING btree ("projectId","featureId");