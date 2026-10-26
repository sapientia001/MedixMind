import { db } from "@/db";
import { alerts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ClientAlerts from "./client-alerts";

export default async function AlertsServer() {
  try {
    const allAlerts = await db
      .select({
        id: alerts.id,
        patientId: alerts.patientId,
        trigger: alerts.trigger,
        severity: alerts.severity,
        isRead: alerts.isRead,
        createdAt: alerts.createdAt,
        patientName: users.accessCode,
      })
      .from(alerts)
      .leftJoin(users, eq(alerts.patientId, users.id))
      .orderBy(desc(alerts.createdAt));

    return <ClientAlerts initialAlerts={allAlerts || []} />;
    
  } catch (error) {
    console.error("Failed to load alerts:", error);
    return <ClientAlerts initialAlerts={[]} />;
  }
}