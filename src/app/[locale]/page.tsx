import { db } from "@/db";
import { users, alerts, assessments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ClientDashboard from "./client-dashboard";

export default async function PatientDashboardServer() {
  // Fetch the patient
  const patientRecords = await db.select().from(users).where(eq(users.role, "patient")).limit(1);
  
  if (patientRecords.length === 0) {
    return <ClientDashboard doctorName="" patientData={null} recentRecords={[]} />;
  }

  const patient = patientRecords[0];

  // Fetch linked Doctor
  let doctorName = "";
  if (patient.doctorId) {
    const doctor = await db.select().from(users).where(eq(users.id, patient.doctorId)).limit(1);
    if (doctor.length > 0 && doctor[0].email) {
      doctorName = doctor[0].email.split('@')[0];
    }
  }

  // Check for Critical Alerts
  const patientAlerts = await db.select().from(alerts).where(
    and(eq(alerts.patientId, patient.id), eq(alerts.isRead, false))
  );
  const hasCriticalAlert = patientAlerts.length > 0;

  // Check for Conflicts
  const hasConflict = patient.medicalHistory ? true : false;

  // Fetch the 3 most recent assessments
  const dbAssessments = await db.select().from(assessments)
    .where(eq(assessments.patientId, patient.id))
    .orderBy(desc(assessments.createdAt))
    .limit(3);

  const recentRecords = dbAssessments.map(r => ({
    id: r.id,
    type: r.type,
    createdAt: r.createdAt || new Date(),
  }));

  const patientData = {
    hasCriticalAlert,
    hasBipolar: patient.bipolarFlag || false,
    hasConflict,
  };

  return <ClientDashboard doctorName={doctorName} patientData={patientData} recentRecords={recentRecords} />;
}