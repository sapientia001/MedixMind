import { db } from "@/db";
import { users, assessments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ClientHistory from "./client-history";

export default async function HistoryServer() {
  // For the demo, fetch the first patient
  const patients = await db.select().from(users).where(eq(users.role, 'patient')).limit(1);
  
  if (patients.length === 0) {
    return <ClientHistory records={[]} />;
  }

  // Fetch all assessments for this patient, newest first
  const dbRecords = await db.select().from(assessments)
    .where(eq(assessments.patientId, patients[0].id))
    .orderBy(desc(assessments.createdAt));

  // Map the data
  const mappedRecords = dbRecords.map(r => ({
    id: r.id,
    type: r.type,
    createdAt: r.createdAt || new Date(),
    rawData: r.rawData
  }));

  return <ClientHistory records={mappedRecords} />;
}