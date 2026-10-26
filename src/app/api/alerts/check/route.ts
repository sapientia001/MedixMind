import { db } from "@/db";
import { alerts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Check if there are any unread MANDATORY alerts
    const unreadAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.isRead, false))
      .orderBy(desc(alerts.createdAt))
      .limit(1);

    if (unreadAlerts.length > 0) {
      return Response.json({ hasAlert: true, alert: unreadAlerts[0] });
    }

    return Response.json({ hasAlert: false });
  } catch (error) {
    console.error("Failed to check alerts:", error);
    return Response.json({ hasAlert: false }, { status: 500 });
  }
}