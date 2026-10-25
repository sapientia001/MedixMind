import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique(),
  role: text('role').$type<'doctor' | 'patient'>().default('patient'),
  accessCode: text('access_code').unique(),
  doctorId: text('doctor_id'),
});

export const assessments = pgTable('assessments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull(),
  type: text('type').notNull(),
  phq9Score: integer('phq9_score'),
  rawData: text('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull(),
  trigger: text('trigger').notNull(),
  severity: text('severity').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});