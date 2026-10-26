import { pgTable, text, boolean, timestamp, integer, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const alerts = pgTable("alerts", {
	id: text().primaryKey().notNull(),
	patientId: text("patient_id").notNull(),
	trigger: text().notNull(),
	severity: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const assessments = pgTable("assessments", {
	id: text().primaryKey().notNull(),
	patientId: text("patient_id").notNull(),
	type: text().notNull(),
	phq9Score: integer("phq9_score"),
	rawData: text("raw_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	photoData: text("photo_data"),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text(),
	role: text().default('patient'),
	accessCode: text("access_code"),
	doctorId: text("doctor_id"),
	bipolarFlag: boolean("bipolar_flag").default(false),
	medicalHistory: text("medical_history"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_access_code_unique").on(table.accessCode),
]);
