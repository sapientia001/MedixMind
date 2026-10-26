CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"doctor_id" text NOT NULL,
	"medication" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
