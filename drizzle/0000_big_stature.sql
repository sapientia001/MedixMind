
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"trigger" text NOT NULL,
	"severity" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"role" text DEFAULT 'patient',
	"access_code" text,
	"doctor_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"type" text NOT NULL,
	"phq9_score" integer,
	"raw_data" text,
	"created_at" timestamp DEFAULT now(),
	"photo_data" text
);