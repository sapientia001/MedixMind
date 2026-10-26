import { db } from "@/db";
import { users, alerts, assessments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import DoctorCommandCenter from "./command-center";

export default async function DoctorDashboardServer() {
  try {
    // 1. Fetch all patients
    const dbPatients = await db.select().from(users).where(eq(users.role, 'patient'));
    
    // 2. Fetch all unread alerts
    const dbAlerts = await db.select().from(alerts).where(eq(alerts.isRead, false));
    
    // 3. Fetch recent doctor notes
    const dbNotes = await db.select().from(assessments)
      .where(eq(assessments.type, 'doctor_note'))
      .orderBy(desc(assessments.createdAt))
      .limit(5);

    // 4. Calculate Metrics for the Dashboard
    const totalPatients = dbPatients.length;
    const criticalPatients = dbPatients.filter(p => dbAlerts.some(a => a.patientId === p.id)).length;
    const stablePatients = totalPatients - criticalPatients;

    // 5. Format recent alerts for the UI
    const recentAlerts = dbAlerts.slice(0, 5).map(alert => ({
      id: alert.id,
      patientId: alert.patientId,
      trigger: alert.trigger,
      severity: alert.severity,
    }));

    return (
      <DoctorCommandCenter 
        metrics={{ totalPatients, criticalPatients, stablePatients }}
        recentAlerts={recentAlerts}
        recentNotes={dbNotes}
      />
    );
  } catch (error) {
    console.error("Failed to load dashboard metrics:", error);
    // Fallback UI if database fails
    return (
      <DoctorCommandCenter 
        metrics={{ totalPatients: 0, criticalPatients: 0, stablePatients: 0 }} 
        recentAlerts={[]} 
        recentNotes={[]} 
      />
    );
  }
}