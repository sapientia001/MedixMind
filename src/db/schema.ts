import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique(),
   name: text('name'),
  password: text('password'),
  role: text('role').$type<'doctor' | 'patient'>().default('patient'),
  accessCode: text('access_code').unique(),
  doctorId: text('doctor_id'),
  bipolarFlag: boolean('bipolar_flag').default(false),
  medicalHistory: text('medical_history'),
});

export const assessments = pgTable('assessments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull(),
  type: text('type').notNull(),
  phq9Score: integer('phq9_score'),
  rawData: text('raw_data'),
  photoData: text('photo_data'), 
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

export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull(),
  doctorId: text('doctor_id').notNull(),
  medication: text('medication').notNull(), // e.g., "Aviandr"
  status: text('status').notNull(), // e.g., "Prescribed"
  createdAt: timestamp('created_at').defaultNow(),
});

// Add this at the bottom of your schema.ts file
export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  senderId: text('sender_id').notNull(),   // Who sent it (Patient or Doctor)
  receiverId: text('receiver_id').notNull(), // Who receives it
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});