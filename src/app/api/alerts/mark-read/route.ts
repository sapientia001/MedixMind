import { db } from "@/db";
import { alerts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { alertId } = await req.json();

    if (!alertId) {
      return Response.json({ error: "Alert ID required" }, { status: 400 });
    }

    // Update the specific alert's isRead status to true
    await db.update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, alertId));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update alert:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}