import { db } from "@/db";
import { users, alerts } from "@/db/schema";
import { eq } from "drizzle-orm";
import DoctorDashboardClient, { PatientData } from "./client-page";

export default async function DoctorPatientsServer() {
  try {
    const dbPatients = await db.select().from(users).where(eq(users.role, 'patient'));
    const dbAlerts = await db.select().from(alerts).where(eq(alerts.isRead, false));

    const mappedPatients: PatientData[] = dbPatients.map((p) => {
      const hasAlert = dbAlerts.some((a) => a.patientId === p.id);
      
      return {
        id: p.id,
        initials: (p.accessCode || p.id).substring(0, 2).toUpperCase(),
        name: p.name || `Patient ${p.accessCode || p.id.substring(0, 4)}`,
        accessCode: p.accessCode, // <--- THIS LINE IS REQUIRED
        meta: `ID: ${p.id.substring(0, 8)}`,
        risk: hasAlert ? "Critical" : "Low",
        type: "Chat", 
        status: hasAlert ? "Needs Review" : "Stable",
        hasBipolar: p.bipolarFlag || false,
        hasContradiction: p.medicalHistory ? true : false, 
      };
    });

    return <DoctorDashboardClient initialPatients={mappedPatients || []} />;
    
  } catch (error) {
    console.error("Failed to load patients:", error);
    return <DoctorDashboardClient initialPatients={[]} />;
  }
}